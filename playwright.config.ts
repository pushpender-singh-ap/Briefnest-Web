import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against the production build in out/, served the way a static host would serve it,
// with the same security and caching headers as production (serve.json mirrors vercel.json).
// `npm run test:e2e` expects `npm run build` to have run (`npm run check` does both).
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
    : { command: `npx serve out --config ../serve.json --listen ${port} --no-clipboard`, url: baseURL, reuseExistingServer: !process.env.CI, timeout: 60_000 },
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
