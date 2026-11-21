import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/unit/setup.ts"],
    restoreMocks: true,
    // Configuration is read from the environment at import time; keep it empty unless a test sets it.
    env: { NEXT_PUBLIC_SITE_URL: "", NEXT_PUBLIC_DOWNLOAD_URL: "", NEXT_PUBLIC_WAITLIST_ENDPOINT: "", NEXT_PUBLIC_CONTACT_EMAIL: "" },
  },
});
