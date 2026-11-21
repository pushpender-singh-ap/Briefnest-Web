import type { MetadataRoute } from "next";
import { brand } from "@/content/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.name,
    description: brand.description,
    start_url: "/",
    display: "browser",
    background_color: "#0b1017",
    theme_color: "#0b1017",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
  };
}
