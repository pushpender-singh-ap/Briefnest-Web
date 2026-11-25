import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type APIResponse } from "@playwright/test";

// A browser skips through a video by asking for parts of the file. These tests ask for parts the way browsers
// do and compare every answer, byte for byte, with the file on disk. On Cloudflare the answers come from the
// film handler in worker/index.ts, which puts each part together from pieces of the video. Run them against a
// deployed site with BASE_URL=https://… to check the real thing.

const videos = join(process.cwd(), "public", "videos");
const names = readdirSync(videos)
  .filter((name) => name.endsWith(".mp4"))
  .sort();
const PIECE = 512 * 1024; // The size of the pieces the handler works with; the ranges below start, end and cross at their edges.
const CACHE = "public, max-age=86400, stale-while-revalidate=604800";

test.describe("film requests", () => {
  test.skip(({ browserName, isMobile }) => browserName !== "chromium" || isMobile, "Plain HTTP requests, no browser involved: one project is enough.");

  /** Expects `response` to be exactly bytes start to end (inclusive) of `file`, labelled as such. */
  async function expectPart(response: APIResponse, file: Buffer, start: number, end: number, label: string) {
    expect(response.status(), label).toBe(206);
    const headers = response.headers();
    expect(headers["content-range"], label).toBe(`bytes ${start}-${end}/${file.length}`);
    expect(headers["content-length"], label).toBe(String(end - start + 1));
    expect(headers["accept-ranges"], label).toBe("bytes");
    expect(headers["content-type"], label).toBe("video/mp4");
    expect(headers["cache-control"], label).toBe(CACHE);
    expect(headers["x-content-type-options"], label).toBe("nosniff");
    expect(headers["etag"], label).toBeTruthy();
    expect((await response.body()).equals(file.subarray(start, end + 1)), `${label}: bytes match the file`).toBe(true);
  }

  for (const name of names) {
    test(`${name} is sent in exact parts`, async ({ request }) => {
      const file = readFileSync(join(videos, name));
      const size = file.length;
      const url = `/videos/${name}`;
      const part = (range: string) => request.get(url, { headers: { Range: range } });

      // Safari's first question, then the whole file as one part.
      await expectPart(await part("bytes=0-1"), file, 0, 1, "bytes=0-1");
      await expectPart(await part("bytes=0-"), file, 0, size - 1, "bytes=0-");
      // A skip ahead: from the middle to the end.
      const middle = Math.floor(size / 2) + 7;
      await expectPart(await part(`bytes=${middle}-`), file, middle, size - 1, "middle to the end");
      // Parts that stop early: across two piece edges, exactly one piece, and inside a single piece.
      await expectPart(await part(`bytes=${PIECE - 3}-${2 * PIECE + 4}`), file, PIECE - 3, 2 * PIECE + 4, "across two piece edges");
      await expectPart(await part(`bytes=${PIECE}-${2 * PIECE - 1}`), file, PIECE, 2 * PIECE - 1, "exactly one piece");
      await expectPart(await part(`bytes=${PIECE + 100}-${PIECE + 199}`), file, PIECE + 100, PIECE + 199, "inside one piece");
      // Parts that begin or end exactly at an edge.
      await expectPart(await part(`bytes=${PIECE + 5}-${3 * PIECE - 1}`), file, PIECE + 5, 3 * PIECE - 1, "ends at a piece edge");
      await expectPart(await part(`bytes=${2 * PIECE}-${2 * PIECE + 10}`), file, 2 * PIECE, 2 * PIECE + 10, "starts at a piece edge");
      await expectPart(await part(`bytes=${PIECE - 1}-${PIECE}`), file, PIECE - 1, PIECE, "two bytes either side of an edge");
      // The end of the file, asked for three ways.
      await expectPart(await part("bytes=-1000"), file, size - 1000, size - 1, "last 1000 bytes");
      await expectPart(await part(`bytes=${size - 1}-${size - 1}`), file, size - 1, size - 1, "last byte");
      await expectPart(await part(`bytes=${size - 10}-${size + 5000}`), file, size - 10, size - 1, "past the end");
      // Everything but the first and last byte: every piece of the video, with both ends cut.
      await expectPart(await part(`bytes=1-${size - 2}`), file, 1, size - 2, "all but two bytes");
    });
  }

  test("a request without a range gets the whole file and is told ranges are available", async ({ request }) => {
    const name = names[0];
    const file = readFileSync(join(videos, name));
    const response = await request.get(`/videos/${name}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["accept-ranges"]).toBe("bytes");
    expect(response.headers()["cache-control"]).toBe(CACHE);
    expect((await response.body()).equals(file)).toBe(true);
  });

  test("a range outside the file is refused, and a malformed one is ignored", async ({ request }) => {
    const name = names[0];
    const file = readFileSync(join(videos, name));
    const url = `/videos/${name}`;

    for (const range of [`bytes=${file.length}-`, `bytes=${file.length + 10}-${file.length + 20}`, "bytes=-0"]) {
      const refused = await request.get(url, { headers: { Range: range } });
      expect(refused.status(), range).toBe(416);
      expect(refused.headers()["content-range"], range).toBe(`bytes */${file.length}`);
    }
    // HTTP lets a server disregard a Range header it doesn't handle; the whole file is the answer.
    for (const range of ["bytes=0-1,5-6", "bytes=5-2", "items=0-1", "bytes=abc"]) {
      const whole = await request.get(url, { headers: { Range: range } });
      expect(whole.status(), range).toBe(200);
      expect((await whole.body()).length, range).toBe(file.length);
    }
  });

  test("If-Range sends a part only while the browser's copy is current", async ({ request }) => {
    const name = names[0];
    const file = readFileSync(join(videos, name));
    const url = `/videos/${name}`;
    const etag = (await request.get(url, { headers: { Range: "bytes=0-1" } })).headers()["etag"];

    await expectPart(await request.get(url, { headers: { Range: "bytes=100-199", "If-Range": etag } }), file, 100, 199, "current copy");
    const stale = await request.get(url, { headers: { Range: "bytes=100-199", "If-Range": '"an-older-file"' } });
    expect(stale.status()).toBe(200);
    expect((await stale.body()).equals(file)).toBe(true);
  });

  test("HEAD describes a part without sending it, and other methods are refused", async ({ request }) => {
    const name = names[0];
    const size = readFileSync(join(videos, name)).length;
    const url = `/videos/${name}`;

    const head = await request.head(url, { headers: { Range: "bytes=10-19" } });
    expect(head.status()).toBe(206);
    expect(head.headers()["content-range"]).toBe(`bytes 10-19/${size}`);
    expect((await head.body()).length).toBe(0);

    const post = await request.post(url);
    expect(post.status()).toBe(405);
  });

  test("an unchanged file is answered with 304, with or without a range", async ({ request }) => {
    const url = `/videos/${names[0]}`;
    const etag = (await request.get(url, { headers: { Range: "bytes=0-1" } })).headers()["etag"];
    expect((await request.get(url, { headers: { "If-None-Match": etag } })).status()).toBe(304);
    expect((await request.get(url, { headers: { "If-None-Match": etag, Range: "bytes=0-99" } })).status()).toBe(304);
  });

  test("a video that doesn't exist gets the not-found page", async ({ request }) => {
    const missing = await request.get("/videos/no-such-film.mp4", { headers: { Range: "bytes=0-1" } });
    expect(missing.status()).toBe(404);
    expect(await missing.text()).toContain("<title>Page not found");
  });
});
