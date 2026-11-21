// Builds the responsive images the site serves.
//
// App captures live in website/assets/captures; brand art is read in place from the film project
// (marketing/briefnest-product-video, or BRIEFNEST_FILM_DIR). Neither is served. Each entry in
// images.config.mjs becomes AVIF and WebP files at several widths in public/img, named with a content hash so
// they can be cached forever, plus one line in src/content/generated/images.json that the <Picture>
// component reads for dimensions and srcset. It also writes the favicon, app icons and the social preview
// image into src/app. The results are kept in the repository, so a deploy needs neither sharp nor the film.
//
//   npm run images          build what changed
//   npm run images -- --force   rebuild everything
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { brand, images, ladder, PIPELINE_VERSION } from "./images.config.mjs";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(site, "assets");
const filmDir = resolve(process.env.BRIEFNEST_FILM_DIR ?? join(site, "..", "marketing", "briefnest-product-video"));
const outDir = join(site, "public", "img");
const manifestPath = join(site, "src", "content", "generated", "images.json");
const appDir = join(site, "src", "app");
const force = process.argv.includes("--force");

// Screenshots are flat colour and small text: keep full chroma so teal glyphs stay crisp.
const encoders = {
  ui: {
    avif: (image) => image.avif({ quality: 62, effort: 5, chromaSubsampling: "4:4:4" }),
    webp: (image) => image.webp({ quality: 86, effort: 5, smartSubsample: true }),
  },
  photo: {
    avif: (image) => image.avif({ quality: 52, effort: 5 }),
    webp: (image) => image.webp({ quality: 78, effort: 5 }),
  },
};

function fail(message) {
  console.error(`images: ${message}`);
  process.exit(1);
}

async function buildOne(entry) {
  const source = join(entry.film ? filmDir : assets, entry.src);
  if (!existsSync(source)) fail(`missing source ${source} for "${entry.id}"`);
  const bytes = await readFile(source);
  const hash = createHash("sha256")
    .update(bytes)
    .update(JSON.stringify({ crop: entry.crop ?? null, kind: entry.kind, widths: entry.widths ?? null, v: PIPELINE_VERSION }))
    .digest("hex")
    .slice(0, 10);

  let base = sharp(bytes);
  const meta = await base.metadata();
  let width = meta.width;
  let height = meta.height;
  if (entry.crop) {
    const [left, top, w, h] = entry.crop;
    if (left + w > width || top + h > height) fail(`crop for "${entry.id}" exceeds ${width}×${height}`);
    base = base.extract({ left, top, width: w, height: h });
    width = w;
    height = h;
  }
  const cropped = await base.png().toBuffer();

  // Never upscale. On the default ladder, add the full size when the next step down would lose more than 12%.
  const steps = (entry.widths ?? ladder).filter((w) => w <= width);
  if (!steps.length || (!entry.widths && width > steps[steps.length - 1] * 1.12)) steps.push(width);

  const written = [];
  let bytesOut = 0;
  for (const w of steps) {
    for (const format of ["avif", "webp"]) {
      const name = `${entry.id}.${hash}-${w}.${format}`;
      const file = join(outDir, name);
      written.push(name);
      if (!force && existsSync(file)) {
        bytesOut += (await stat(file)).size;
        continue;
      }
      const resized = sharp(cropped).resize({ width: w, kernel: "lanczos3", withoutEnlargement: true });
      const data = await encoders[entry.kind][format](resized).toBuffer();
      await writeFile(file, data);
      bytesOut += data.length;
    }
  }
  return {
    id: entry.id,
    record: { base: `/img/${entry.id}.${hash}`, width, height, widths: steps },
    files: written,
    bytesOut,
  };
}

/** PNG-in-ICO: one directory entry per size, PNG payloads as they are. */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + pngs.length * 16;
  const entries = pngs.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

async function brandFiles() {
  const icon = join(filmDir, brand.icon);
  const poster = join(filmDir, brand.poster);
  for (const file of [icon, poster]) if (!existsSync(file)) fail(`missing ${file}`);

  // The 1024 px master follows the macOS icon grid: an 824 px tile with a soft shadow around it.
  const tile = { left: 100, top: 100, width: 824, height: 824 };
  const png = (size) => sharp(icon).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
  // Tab and home-screen icons are small; an indexed palette keeps them light without visible banding.
  const indexed = { compressionLevel: 9, palette: true, quality: 92, effort: 10 };
  await writeFile(join(appDir, "icon.png"), await sharp(icon).resize(192, 192, { kernel: "lanczos3" }).png(indexed).toBuffer());
  await writeFile(
    join(appDir, "favicon.ico"),
    ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) })))),
  );
  // iOS masks the image itself, so fill the tile edge to edge on the icon's own base colour.
  await writeFile(
    join(appDir, "apple-icon.png"),
    await sharp(icon).extract(tile).resize(180, 180, { kernel: "lanczos3" }).flatten({ background: "#10123a" }).png(indexed).toBuffer(),
  );
  // Social preview: the film's own title frame, cropped to 1200 × 630.
  await writeFile(
    join(appDir, "opengraph-image.jpg"),
    await sharp(poster).resize(1200, 630, { fit: "cover", position: "centre", kernel: "lanczos3" }).jpeg({ quality: 86, mozjpeg: true }).toBuffer(),
  );
  // <video poster> takes one URL; a single JPEG keeps it simple for the player.
  await writeFile(
    join(site, "public", "videos", "briefnest-film-poster.jpg"),
    await sharp(poster).resize(1280, 720, { kernel: "lanczos3" }).jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
  );
}

const ids = new Set();
for (const entry of images) {
  if (ids.has(entry.id)) fail(`duplicate id "${entry.id}"`);
  ids.add(entry.id);
  if (!encoders[entry.kind]) fail(`unknown kind "${entry.kind}" for "${entry.id}"`);
}

await mkdir(outDir, { recursive: true });
await mkdir(dirname(manifestPath), { recursive: true });

const started = Date.now();
const results = [];
const queue = [...images];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let entry = queue.shift(); entry; entry = queue.shift()) results.push(await buildOne(entry));
  }),
);
results.sort((a, b) => a.id.localeCompare(b.id));

const keep = new Set(results.flatMap((r) => r.files));
for (const name of await readdir(outDir)) if (!keep.has(name)) await rm(join(outDir, name));

await writeFile(manifestPath, JSON.stringify(Object.fromEntries(results.map((r) => [r.id, r.record])), null, 2) + "\n");
await brandFiles();

const total = results.reduce((sum, r) => sum + r.bytesOut, 0);
console.log(
  `images: ${results.length} images, ${keep.size} files, ${(total / 1024 / 1024).toFixed(1)} MB in public/img (${((Date.now() - started) / 1000).toFixed(1)}s)`,
);
