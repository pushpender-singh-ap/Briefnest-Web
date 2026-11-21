import type { MetadataRoute } from "next";
import { deployment } from "@/content/site";

export const dynamic = "force-static";

/** Every page, with absolute URLs. Empty until the site knows its own address (NEXT_PUBLIC_SITE_URL). */
export const routes = ["/", "/features", "/download", "/changelog", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const { origin } = deployment;
  if (!origin) return [];
  return routes.map((path) => ({
    url: new URL(path, origin).toString(),
    changeFrequency: path === "/" || path === "/download" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/features" || path === "/download" ? 0.8 : 0.4,
  }));
}
