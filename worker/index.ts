/**
 * Byte ranges for the film, on Cloudflare Workers.
 *
 * Cloudflare's file serving answers a Range request with the whole file and a 200. A browser needs
 * 206 Partial Content to skip ahead in a video, and Safari needs it to play one at all. So wrangler.jsonc sends
 * requests for the video files here and nothing else: every other file is served without this code.
 *
 * File serving doesn't tell a Worker how long a file is, so the lengths come from video-sizes.json, which
 * `npm run build` writes (scripts/video-sizes.mjs).
 */
import { parseRange, type Span } from "./range";
import sizes from "./video-sizes.json";

/** The length in bytes of each video file, by its path on the site. */
const lengths: Record<string, number | undefined> = sizes;

/**
 * Bytes moved per step. Large steps keep this code's own processor time per request small, which matters on
 * Cloudflare's free plan: it allows 10 ms per request.
 */
const STEP = 512 * 1024;

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

  // Ask for the whole file: file serving ignores Range, and leaves out its caching headers when it sees one.
  const headers = new Headers(request.headers);
  headers.delete("Range");
  headers.delete("If-Range");
  const asset = await env.ASSETS.fetch(new Request(request.url, { method: request.method, headers }));

  const path = new URL(request.url).pathname;
  const size = lengths[path];
  // The file's own headers, with the ones public/_headers adds.
  const out = new Headers(asset.headers);
  if (size !== undefined) out.set("Accept-Ranges", "bytes");
  const whole = () => new Response(asset.body, { status: asset.status, headers: out });

  const range = request.headers.get("Range");
  if (size === undefined || range === null || asset.status !== 200) return whole();
  // If-Range: send a part only if the copy the browser already holds is still the current file.
  const ifRange = request.headers.get("If-Range");
  if (ifRange !== null && ifRange !== asset.headers.get("ETag")) return whole();

  const span = parseRange(range, size);
  if (span === "ignored") return whole();
  if (span === "unsatisfiable") {
    await asset.body?.cancel();
    return new Response(null, { status: 416, headers: { "Accept-Ranges": "bytes", "Content-Range": `bytes */${size}` } });
  }

  const length = span.end - span.start + 1;
  out.set("Content-Range", `bytes ${span.start}-${span.end}/${size}`);
  if (request.method === "HEAD" || !asset.body) {
    await asset.body?.cancel();
    out.set("Content-Length", String(length));
    return new Response(null, { status: 206, headers: out });
  }

  // The whole file: hand back the file's own stream, so none of it passes through this code.
  if (length === size) return new Response(asset.body, { status: 206, headers: out });

  // FixedLengthStream makes the runtime send Content-Length instead of chunked encoding.
  const { readable, writable } = new FixedLengthStream(length);
  ctx.waitUntil(copy(asset.body, writable, span, size, path));
  return new Response(readable, { status: 206, headers: out });
}

/**
 * Sends the bytes of `span` from `body` to `writable`: reads past the bytes before the span, then copies.
 * A span that runs to the end of the file is handed to the runtime to move; only one that stops early is
 * copied here, step by step. A browser that stops listening, as it does on every skip, ends the copy quietly.
 */
async function copy(body: ReadableStream<Uint8Array>, writable: WritableStream<Uint8Array>, span: Span, size: number, path: string): Promise<void> {
  const reader = body.getReader({ mode: "byob" });
  // One buffer serves the whole copy: each read hands it to the runtime and gets it back.
  let buffer: ArrayBufferLike = new ArrayBuffer(STEP);
  const read = async (bytes: number): Promise<Uint8Array> => {
    const { value } = await reader.readAtLeast(bytes, new Uint8Array(buffer, 0, bytes));
    if (!value || value.byteLength < bytes) {
      console.error(JSON.stringify({ message: "video file is shorter than worker/video-sizes.json says; rebuild and redeploy", path, size }));
      throw new Error("The video file is shorter than its recorded size.");
    }
    buffer = value.buffer;
    return value;
  };

  try {
    for (let left = span.start; left > 0; ) {
      const bytes = Math.min(STEP, left);
      await read(bytes);
      left -= bytes;
    }
  } catch (error) {
    await Promise.allSettled([reader.cancel(error), writable.abort(error)]);
    return;
  }

  if (span.end === size - 1) {
    reader.releaseLock();
    await body.pipeTo(writable).catch(() => {});
    return;
  }

  const writer = writable.getWriter();
  try {
    for (let left = span.end - span.start + 1; left > 0; ) {
      const bytes = Math.min(STEP, left);
      await writer.write(await read(bytes));
      left -= bytes;
    }
    await writer.close();
    await reader.cancel();
  } catch (error) {
    await Promise.allSettled([reader.cancel(error), writer.abort(error)]);
  }
}
