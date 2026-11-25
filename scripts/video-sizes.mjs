// Writes worker/video-sizes.json: the length in bytes of every video file the site serves.
//
// The film handler (worker/index.ts) needs a file's length to answer a byte-range request, and Cloudflare's
// file serving doesn't report it to a Worker. The list is kept in the repository, like the generated images.
//
//   node scripts/video-sizes.mjs            reads out/videos; `npm run build` runs this, so the list always
//                                           describes the files about to be deployed
//   node scripts/video-sizes.mjs public     reads public/videos; `npm run media` runs this after re-encoding
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2] ?? "out";
if (source !== "out" && source !== "public") {
  console.error("Usage: node scripts/video-sizes.mjs [out|public]");
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

const sizes = Object.fromEntries(names.map((name) => [`/videos/${name}`, statSync(join(videos, name)).size]));
const file = join(site, "worker", "video-sizes.json");
const next = `${JSON.stringify(sizes, null, 2)}\n`;
let current = "";
try {
  current = readFileSync(file, "utf8");
} catch {
  // First run: there is no list yet.
}
if (current === next) {
  console.log(`worker/video-sizes.json is up to date (${names.length} videos in ${source}/videos).`);
} else {
  writeFileSync(file, next);
  console.log(`Wrote worker/video-sizes.json from ${source}/videos (${names.length} videos).`);
}
