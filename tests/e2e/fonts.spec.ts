import { expect, test, type Browser } from "@playwright/test";
import { PAGES } from "./helpers";

// On a slow connection the page paints in fallback fonts first. If those set wider or narrower than the real
// ones, the first screen re-wraps when the fonts arrive and everything below jumps. The fallbacks in
// globals.css are sized so that doesn't happen; this checks it by loading each page with the font files
// blocked and comparing the first screen with the normal load.

async function firstScreen(browser: Browser, baseURL: string, path: string, width: number, blockFonts: boolean) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  if (blockFonts) await page.route("**/*.woff2", (route) => route.abort());
  await page.goto(baseURL + path, { waitUntil: "networkidle" });
  const layout = await page.evaluate(() => {
    const first = document.querySelector("main")!.querySelector("section, header")!;
    const box = (element: Element | null) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return [Math.round(rect.top + scrollY), Math.round(rect.height)];
    };
    return { h1: box(document.querySelector("h1")), lead: box(first.querySelector(".t-lead")), block: Math.round(first.getBoundingClientRect().height) };
  });
  await context.close();
  return layout;
}

for (const path of PAGES) {
  test(`${path} keeps its first screen when the web fonts arrive`, async ({ browser, baseURL, browserName, isMobile }) => {
    test.skip(browserName !== "chromium" || isMobile, "Layout is measured once, in Chrome, at each width.");
    for (const width of [375, 412, 768, 1024, 1440]) {
      const fallback = await firstScreen(browser, baseURL!, path, width, true);
      const loaded = await firstScreen(browser, baseURL!, path, width, false);
      expect(fallback, `${path} at ${width}px`).toEqual(loaded);
    }
  });
}
