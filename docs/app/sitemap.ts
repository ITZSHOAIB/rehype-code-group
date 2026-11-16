import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/shared";
import { source } from "@/lib/source";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), priority: 1 },
    ...source.getPages().map((page) => ({
      url: absoluteUrl(page.url),
      priority: page.url === "/docs" ? 0.9 : 0.7,
    })),
  ];
}
