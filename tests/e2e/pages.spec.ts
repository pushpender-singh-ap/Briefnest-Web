import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PAGES, settle, watchForProblems } from "./helpers";

for (const path of PAGES) {
  test.describe(`page ${path}`, () => {
    test("loads cleanly with one h1, a title and a description", async ({ page }) => {
      const problems = watchForProblems(page);
      await page.goto(path);
      await settle(page);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(/Briefnest/);
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length ?? 0).toBeGreaterThan(50);
      expect(problems).toEqual([]);
    });

    test("has no WCAG A or AA violations that axe can detect", async ({ page }) => {
      await page.goto(path);
      await settle(page);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(" | ")}`)).toEqual([]);
    });

    test("never scrolls sideways", async ({ page }) => {
      for (const width of [375, 768, 1024, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  });
}

test("every internal link leads somewhere real", async ({ page, request }) => {
  const seen = new Map<string, Set<string>>();
  for (const path of PAGES) {
    await page.goto(path);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
    for (const href of hrefs) {
      const [target, hash = ""] = href.split("#");
      if (!seen.has(target)) seen.set(target, new Set());
      if (hash) seen.get(target)!.add(hash);
    }
  }
  // Six pages, plus the film file that the "Watch" links fall back to.
  expect(seen.size).toBeGreaterThanOrEqual(7);

  for (const [target, hashes] of seen) {
    const response = await request.get(target);
    expect(response.status(), target).toBe(200);
    if (hashes.size) {
      await page.goto(target);
      for (const hash of hashes) await expect(page.locator(`[id="${hash}"]`), `${target}#${hash}`).toHaveCount(1);
    }
  }
});

test("an unknown address gets the not-found page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nothing here.");
  await expect(page.getByRole("link", { name: "Go to the home page" })).toBeVisible();
});

test("a missing file gets the not-found page too, with the security headers", async ({ request }) => {
  // Not a page navigation: the way a script, an image tag or a crawler asks.
  const response = await request.get("/no-such-file.txt");
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain("<title>Page not found");
  expect(response.headers()["content-security-policy"]).toContain("default-src 'self'");
});

test("is served with the production security and caching headers", async ({ request }) => {
  const page = await request.get("/");
  expect(page.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(page.headers()["x-content-type-options"]).toBe("nosniff");
  const film = await request.get("/videos/briefnest-film-1080p.mp4", { headers: { Range: "bytes=0-99" } });
  // Seeking needs range requests; a static host must answer them.
  expect(film.status()).toBe(206);
  expect(film.headers()["cache-control"]).toContain("max-age=86400");
});

test("ships robots.txt, a sitemap and a web manifest", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  // This build has no configured origin, so it must keep itself out of search results.
  expect(await robots.text()).toContain("Disallow: /");
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
  expect((await request.get("/opengraph-image.jpg")).status()).toBe(200);
});

test("the download page tells the truth when no build is published", async ({ page }) => {
  await page.goto("/download");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Briefnest for Mac.");
  await expect(page.getByText("Not available to download yet.")).toBeVisible();
  await expect(page.getByText("0.1.0").first()).toBeVisible();
  await expect(page.getByText("macOS 15 or later · Apple Silicon")).toBeVisible();
  await expect(page.locator('a[href$=".dmg"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: /download for mac/i })).toHaveCount(0);
  await expect(page.getByText(/Pricing hasn’t been announced/)).toBeVisible();
});

test("the legal pages say they are drafts", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("complementary", { name: "Document status" })).toContainText("Draft for legal review");
  await page.goto("/terms");
  await expect(page.getByRole("complementary", { name: "Document status" })).toContainText("Draft, not in force");
});
