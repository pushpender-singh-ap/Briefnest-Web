import type { Page } from "@playwright/test";

export const PAGES = ["/", "/features", "/download", "/changelog", "/privacy", "/terms"] as const;

/** Walks the page top to bottom so lazy images load and scroll reveals finish, then returns to the top. */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(900);
}

/** Collects console errors and failed requests for a page, so a test can assert there were none. */
export function watchForProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
  page.on("requestfailed", (request) => {
    // A video request cancelled because the test moved on is not a failure of the site.
    if (request.failure()?.errorText.match(/abort|cancel/i)) return;
    problems.push(`request failed: ${request.url()} (${request.failure()?.errorText})`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  return problems;
}
