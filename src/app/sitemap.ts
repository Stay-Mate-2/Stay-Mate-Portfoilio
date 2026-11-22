import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Emitted only once the production URL is configured (absolute URLs are required). */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  const lastModified = new Date();
  return [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
