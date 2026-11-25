/**
 * Byte ranges for the film, on Cloudflare Workers.
 *
 * Cloudflare's file serving answers a Range request with the whole file and a 200. A browser needs
 * 206 Partial Content to skip ahead in a video, and Safari needs it to play one at all. So wrangler.jsonc sends
 * requests for the video files here and nothing else: every other file is served without this code.
 *
 * File serving also hands a Worker a file from its first byte only, and reading past megabytes to reach a later
 * part costs processor time (about 1.2 ms a megabyte, measured on Cloudflare; the free plan allows 10 ms a
 * request). So `npm run build` stores each video a second time as pieces of 512 KiB (scripts/video-pieces.mjs),
 * and a part is put together from the pieces that hold it. Whole pieces are moved by the runtime, which costs
 * this code nothing; at most one piece is read past at the start of a part and one is copied at its end.
 */
import { parseRange, type Span } from "./range";
import list from "./videos.json";

/** The length in bytes of each video file, by its path on the site. */
const lengths: Record<string, number | undefined> = list.videos;
/** The size of a piece. The last piece of a video is shorter. */
const PIECE = list.pieceBytes;

export default {
  async fetch(request, env, ctx): Promise<Response> {
    try {
      return await respond(request, env, ctx);
    } catch (error) {
      const path = new URL(request.url).pathname;
      console.error(JSON.stringify({ message: "film request failed", path, error: error instanceof Error ? error.message : String(error) }));
      return new Response("The film could not be loaded.", { status: 500, headers: { "Cache-Control": "no-store" } });
    }
  },
} satisfies ExportedHandler<Env>;

async function respond(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const path = new URL(request.url).pathname;
  const size = lengths[path];
  const range = request.headers.get("Range");

  // The file as file serving has it. Range is left out: file serving ignores it, and leaves out its caching
  // headers when it sees one.
  const headers = new Headers(request.headers);
  headers.delete("Range");
  headers.delete("If-Range");
  const file = (method: string) => env.ASSETS.fetch(new Request(request.url, { method, headers }));
  /** The whole file, as the answer. */
  const whole = async () => {
    const asset = await file(request.method);
    const out = new Headers(asset.headers);
    if (size !== undefined) out.set("Accept-Ranges", "bytes");
    return new Response(asset.body, { status: asset.status, headers: out });
  };

  if (size === undefined || range === null) return whole();

  // Ask about the file without fetching it: whether it is there and unchanged, and its headers, which include
  // the ones public/_headers adds.
  const about = await file("HEAD");
  if (about.status === 304) return new Response(null, { status: 304, headers: about.headers });
  if (about.status !== 200) return whole();
  // If-Range: send a part only if the copy the browser already holds is still the current file.
  const ifRange = request.headers.get("If-Range");
  if (ifRange !== null && ifRange !== about.headers.get("ETag")) return whole();

  const span = parseRange(range, size);
  if (span === "ignored") return whole();
  if (span === "unsatisfiable") {
    return new Response(null, { status: 416, headers: { "Accept-Ranges": "bytes", "Content-Range": `bytes */${size}` } });
  }

  const length = span.end - span.start + 1;
  const out = new Headers(about.headers);
  // The length of the part is set by the runtime from the stream below, or just below for HEAD.
  out.delete("Content-Length");
  out.set("Accept-Ranges", "bytes");
  out.set("Content-Range", `bytes ${span.start}-${span.end}/${size}`);
  if (request.method === "HEAD") {
    out.set("Content-Length", String(length));
    return new Response(null, { status: 206, headers: out });
  }

  // The whole file as one part: hand back the file's own stream, so none of it passes through this code.
  if (length === size) return new Response((await file("GET")).body, { status: 206, headers: out });

  // FixedLengthStream makes the runtime send Content-Length instead of chunked encoding.
  const { readable, writable } = new FixedLengthStream(length);
  ctx.waitUntil(send(env, request.url, path, span, size, writable));
  return new Response(readable, { status: 206, headers: out });
}

/**
 * Sends the bytes of `span` to `writable`, from the pieces of the video at `path`. A browser that stops
 * listening, as it does on every skip, ends this quietly.
 */
async function send(env: Env, base: string, path: string, span: Span, size: number, writable: WritableStream<Uint8Array>): Promise<void> {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const first = Math.floor(span.start / PIECE);
  const last = Math.floor(span.end / PIECE);
  // One buffer serves every read: each read hands it to the runtime and gets it back.
  let buffer: ArrayBufferLike = new ArrayBuffer(0);

  try {
    for (let index = first; index <= last; index++) {
      const start = index * PIECE;
      const pieceLength = Math.min(PIECE, size - start);
      // The bytes wanted from this piece: all of it, except at the two ends of the span.
      const from = index === first ? span.start - start : 0;
      const to = index === last ? span.end - start : pieceLength - 1;

      const address = new URL(`/videos/pieces/${name}/${String(index).padStart(4, "0")}`, base);
      const piece = await env.ASSETS.fetch(address);
      if (piece.status !== 200 || !piece.body) {
        await piece.body?.cancel();
        throw fault("a piece of the video is missing; rebuild and redeploy", path, index);
      }

      // A whole piece: the runtime moves it, and none of it passes through this code.
      if (from === 0 && to === pieceLength - 1) {
        await piece.body.pipeTo(writable, { preventClose: true });
        continue;
      }

      const reader = piece.body.getReader({ mode: "byob" });
      const read = async (bytes: number): Promise<Uint8Array> => {
        if (buffer.byteLength < bytes) buffer = new ArrayBuffer(PIECE);
        const { value } = await reader.readAtLeast(bytes, new Uint8Array(buffer, 0, bytes));
        if (!value || value.byteLength < bytes) throw fault("a piece of the video is shorter than worker/videos.json says; rebuild and redeploy", path, index);
        buffer = value.buffer;
        return value;
      };

      let handedOver = false;
      try {
        // Read past the bytes before the span. If the rest of the piece is wanted, the runtime moves it.
        if (from > 0) await read(from);
        if (to === pieceLength - 1) {
          reader.releaseLock();
          handedOver = true;
          await piece.body.pipeTo(writable, { preventClose: true });
          continue;
        }

        // The span ends inside this piece: copy the bytes up to its end, and leave the rest unread.
        const writer = writable.getWriter();
        try {
          await writer.write(await read(to - from + 1));
        } finally {
          writer.releaseLock();
        }
        await reader.cancel();
      } catch (error) {
        if (!handedOver) await reader.cancel(error).catch(() => {});
        throw error;
      }
    }
    await writable.close();
  } catch (error) {
    await writable.abort(error).catch(() => {});
  }
}

/** Logs a fault in what was deployed, as opposed to a browser going away, and returns it as an error. */
function fault(message: string, path: string, piece: number): Error {
  console.error(JSON.stringify({ message, path, piece }));
  return new Error(message);
}
