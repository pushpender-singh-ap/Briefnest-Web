// Takes review screenshots of a running site (dev, or `npm run preview`).
//
//   node scripts/shoot.mjs                       home page at the five review widths, full page
//   node scripts/shoot.mjs /features 1440        one path, one width
//   node scripts/shoot.mjs /#faq 375 --viewport  only what fits in the viewport
//
// Output: website/.screenshots/<path>-<width>.png. BASE_URL overrides http://localhost:3210.
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "@playwright/test";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(site, ".screenshots");
const base = process.env.BASE_URL ?? "http://localhost:3210";
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [path = "/", ...widthArgs] = args.filter((a) => !a.startsWith("--"));
const widths = widthArgs.length ? widthArgs.map(Number) : [375, 768, 1024, 1440, 1920];
const heights = { 375: 812, 768: 1024, 1024: 768, 1440: 900, 1920: 1080 };

await mkdir(out, { recursive: true });
const browser = await (flags.has("--webkit") ? webkit : chromium).launch();
for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: heights[width] ?? 900 },
    deviceScaleFactor: width <= 768 ? 2 : 1,
    reducedMotion: flags.has("--motion") ? "no-preference" : "reduce",
  });
  const page = await context.newPage();
  await page.goto(base + path, { waitUntil: "networkidle" });
  if (!flags.has("--viewport")) {
    // Walk the page so lazy images load and scroll reveals fire, then return to the top.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 500) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(90);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
  } else {
    await page.waitForTimeout(900);
  }
  const name = `${path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home"}-${width}${flags.has("--webkit") ? "-webkit" : ""}.png`;
  await page.screenshot({ path: join(out, name), fullPage: !flags.has("--viewport") });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`${name}${overflow > 0 ? `  ⚠ horizontal overflow ${overflow}px` : ""}`);
  await context.close();
}
await browser.close();
