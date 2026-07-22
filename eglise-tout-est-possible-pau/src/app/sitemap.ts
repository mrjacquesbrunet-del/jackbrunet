import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

const routes: Array<{ path: string; priority: number }> = [
  { path: "", priority: 1 },
  { path: "/premiere-visite", priority: 0.9 },
  { path: "/reunions", priority: 0.9 },
  { path: "/a-propos", priority: 0.8 },
  { path: "/vision", priority: 0.7 },
  { path: "/equipe", priority: 0.7 },
  { path: "/messages", priority: 0.8 },
  { path: "/temoignages", priority: 0.8 },
  { path: "/dons", priority: 0.7 },
  { path: "/contact", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));
}
