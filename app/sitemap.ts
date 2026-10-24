import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllArticles, getAllPageSlugs, getAllTags } from "@/lib/sanity";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, pages, tags] = await Promise.all([getAllArticles(500), getAllPageSlugs(), getAllTags()]);
  const now = new Date();
  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/aktualnosci`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/wyniki-live`, lastModified: now, changeFrequency: "always", priority: 0.9 },
    { url: `${SITE_URL}/ranking`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/kalendarz`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/wideo`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/kontakt`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
  return [
    ...statics,
    ...articles.map((a) => ({
      url: `${SITE_URL}/aktualnosci/${a.id}`,
      lastModified: new Date(a.updatedAt || a.date || now),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...tags.map((t) => ({ url: `${SITE_URL}/tag/${t.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.4 })),
    ...pages.map((slug) => ({ url: `${SITE_URL}/strona/${slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.2 })),
  ];
}
