import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { film } from "@/content/site";
import { parseRange } from "../../worker/range";
import sizes from "../../worker/video-sizes.json";

// The film handler itself (worker/index.ts) runs only on Cloudflare's runtime, so it is tested there:
// tests/e2e/film-ranges.spec.ts sends it real requests. These are the parts that can be checked without it.

describe("the list of video lengths the film handler uses", () => {
  const videos = join(process.cwd(), "public", "videos");

  it("names every video file with its exact length (if this fails, run `npm run build`)", () => {
    const onDisk = Object.fromEntries(
      readdirSync(videos)
        .filter((name) => name.endsWith(".mp4"))
        .sort()
        .map((name) => [`/videos/${name}`, statSync(join(videos, name)).size]),
    );
    expect(sizes).toEqual(onDisk);
  });

  it("covers every file the player and the hero preview load", () => {
    // wrangler.jsonc sends "/videos/*.mp4" to the handler. A source in another folder or format would be
    // served without byte ranges on Cloudflare, and then it couldn't be skipped through.
    for (const source of [...film.sources, ...film.preview]) expect(Object.keys(sizes), source.src).toContain(source.src);
  });
});

describe("reading a Range header", () => {
  const SIZE = 1000;

  it.each([
    ["bytes=0-1", { start: 0, end: 1 }],
    ["bytes=0-", { start: 0, end: 999 }],
    ["bytes=500-", { start: 500, end: 999 }],
    ["bytes=200-299", { start: 200, end: 299 }],
    ["bytes=999-999", { start: 999, end: 999 }],
    ["bytes=-100", { start: 900, end: 999 }],
    ["BYTES=0-9", { start: 0, end: 9 }],
    ["  bytes=0-9 ", { start: 0, end: 9 }],
  ])("%s is the bytes asked for", (header, span) => {
    expect(parseRange(header, SIZE)).toEqual(span);
  });

  it("stops at the end of the file when asked for more", () => {
    expect(parseRange("bytes=900-5000", SIZE)).toEqual({ start: 900, end: 999 });
    expect(parseRange("bytes=-5000", SIZE)).toEqual({ start: 0, end: 999 });
    expect(parseRange("bytes=0-99999999999999999999", SIZE)).toEqual({ start: 0, end: 999 });
  });

  it.each(["bytes=1000-", "bytes=1000-2000", "bytes=99999999999999999999-", "bytes=-0"])("%s can't be satisfied", (header) => {
    expect(parseRange(header, SIZE)).toBe("unsatisfiable");
  });

  it("can't satisfy any range of an empty file", () => {
    expect(parseRange("bytes=0-", 0)).toBe("unsatisfiable");
    expect(parseRange("bytes=-10", 0)).toBe("unsatisfiable");
  });

  it.each(["bytes=0-1,5-6", "bytes=-", "bytes=5-2", "items=0-1", "bytes=a-b", "bytes=0-1 ,", "0-1", ""])("%j is ignored, so the whole file is sent", (header) => {
    expect(parseRange(header, SIZE)).toBe("ignored");
  });
});
