import type { NextConfig } from "next";

// The site is a static export: `next build` writes plain HTML, CSS and JS to `out/`, which any static host can
// serve. Nothing here needs a server at request time.
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  // Screenshots and artwork are pre-built by scripts/build-images.mjs and served through <Picture>, so the
  // on-demand optimizer (which needs a server) stays off.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
