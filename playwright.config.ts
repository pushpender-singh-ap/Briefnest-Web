import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against the production build in out/, served by the runtime that serves it on Cloudflare
// (`wrangler dev`, entirely on this machine): the same file routing, the headers in public/_headers and the
// film handler in worker/. `npm run test:e2e` expects `npm run build` to have run (`npm run check` does both).
// Set BASE_URL to test a site that is already running, such as the deployed one.
const port = Number(process.env.E2E_PORT ?? 4173);
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL, trace: "retain-on-failure" },
  webServer: process.env.BASE_URL
    ? undefined
    : { command: `npx wrangler dev --port ${port} --persist-to .wrangler/e2e`, url: baseURL, reuseExistingServer: !process.env.CI, timeout: 60_000 },
  projects: [
    {
      // Installed Google Chrome, because Playwright's own Chromium ships without the H.264 and AAC decoders
      // the film needs. Set PW_CHANNEL=chromium to use the bundled browser; the playback test then skips itself.
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, channel: process.env.PW_CHANNEL ?? "chrome" },
    },
    { name: "desktop-safari", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
});
