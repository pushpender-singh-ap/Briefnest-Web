// Prepares the videos for Cloudflare, where the film handler (worker/index.ts) answers byte-range requests.
//
// Cloudflare's file serving hands a Worker a file from its first byte only. Reading past megabytes to reach a
// later part costs processor time: about 1.2 ms a megabyte, measured on Cloudflare, where the free plan allows
// 10 ms a request. So each video is also stored as pieces of 512 KiB, and the handler reads only the pieces a
// request needs. worker/videos.json tells it the piece size and each video's length; that list is kept in the
// repository, like the generated images.
//
//   node scripts/video-pieces.mjs            after `next build`: cuts out/videos/*.mp4 into out/videos/pieces/
//                                           and writes the list, so both always describe what is deployed
//   node scripts/video-pieces.mjs public     after re-encoding (`npm run media`): writes the list from
//                                           public/videos; the pieces are cut by the next build
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PIECE_BYTES = 512 * 1024;

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2] ?? "out";
if (source !== "out" && source !== "public") {
  console.error("Usage: node scripts/video-pieces.mjs [out|public]");
  process.exit(1);
}

const videos = join(site, source, "videos");
let names;
try {
  names = readdirSync(videos).filter((name) => name.endsWith(".mp4")).sort();
} catch {
  console.error(`No ${source}/videos folder.${source === "out" ? " Run `next build` first." : ""}`);
  process.exit(1);
}
if (!names.length) {
  console.error(`No .mp4 files in ${source}/videos.`);
  process.exit(1);
}

let pieces = 0;
if (source === "out") {
  const folder = join(videos, "pieces");
  rmSync(folder, { recursive: true, force: true });
  for (const name of names) {
    const bytes = readFileSync(join(videos, name));
    mkdirSync(join(folder, name), { recursive: true });
    for (let index = 0; index * PIECE_BYTES < bytes.length; index++) {
      // Served at /videos/pieces/<file name>/0000, 0001, …
      writeFileSync(join(folder, name, String(index).padStart(4, "0")), bytes.subarray(index * PIECE_BYTES, (index + 1) * PIECE_BYTES));
      pieces += 1;
    }
  }
}

const list = {
  pieceBytes: PIECE_BYTES,
  videos: Object.fromEntries(names.map((name) => [`/videos/${name}`, statSync(join(videos, name)).size])),
};
const file = join(site, "worker", "videos.json");
const next = `${JSON.stringify(list, null, 2)}\n`;
let current = "";
try {
  current = readFileSync(file, "utf8");
} catch {
  // First run: there is no list yet.
}
if (current !== next) writeFileSync(file, next);
console.log(
  `${names.length} videos in ${source}/videos` +
    (source === "out" ? `, cut into ${pieces} pieces of ${PIECE_BYTES / 1024} KiB` : "") +
    `; worker/videos.json ${current === next ? "is up to date" : "written"}.`,
);
