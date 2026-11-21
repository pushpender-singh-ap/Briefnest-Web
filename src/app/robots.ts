import type { MetadataRoute } from "next";
import { deployment } from "@/content/site";

export const dynamic = "force-static";

/** Production with a known address is open to crawlers. Previews and unconfigured builds are not. */
export default function robots(): MetadataRoute.Robots {
  if (!deployment.indexable || !deployment.origin) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", deployment.origin).toString(),
  };
}
