import { createClient } from "next-sanity";
import type { NewsArticle } from "./mock-data";

function isSanityConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
}

function getClient() {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-01-01",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });
}

// ── GROQ queries ──────────────────────────────────────────────────────────────

const ARTICLE_FIELDS = `
  "id": slug.current,
  title,
  excerpt,
  category,
  "date": date,
  readTime,
  imageQuery,
  featured,
  author,
  authorRole,
  content[] {
    "type": type,
    "text": text,
    "author": quoteAuthor
  }
`;

export async function getAllArticles(): Promise<NewsArticle[]> {
  if (!isSanityConfigured()) return [];
  try {
    const results = await getClient().fetch<NewsArticle[]>(
      `*[_type == "article"] | order(date desc) { ${ARTICLE_FIELDS} }`,
    );
    return Array.isArray(results) ? results : [];
  } catch (err) {
    console.error("Sanity getAllArticles error:", err);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  if (!isSanityConfigured()) return null;
  try {
    return await getClient().fetch<NewsArticle | null>(
      `*[_type == "article" && slug.current == $slug][0] { ${ARTICLE_FIELDS} }`,
      { slug },
    );
  } catch (err) {
    console.error("Sanity getArticleBySlug error:", err);
    return null;
  }
}

export async function getAllArticleSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) return [];
  try {
    const results = await getClient().fetch<Array<{ slug: string }>>(
      `*[_type == "article"]{ "slug": slug.current }`,
    );
    return Array.isArray(results) ? results.map((r) => r.slug).filter(Boolean) : [];
  } catch (err) {
    console.error("Sanity getAllArticleSlugs error:", err);
    return [];
  }
}

// ── Video ─────────────────────────────────────────────────────────────────────

export interface SanityVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  players?: string;
  tournament?: string;
  date?: string;
  duration?: string;
  category?: "Highlights" | "Full Match" | "Interview" | "Analysis";
}

const VIDEO_FIELDS = `
  "id": _id,
  title,
  youtubeUrl,
  description,
  players,
  tournament,
  date,
  duration,
  category
`;

export async function getAllVideos(): Promise<SanityVideo[]> {
  if (!isSanityConfigured()) return [];
  try {
    const results = await getClient().fetch<SanityVideo[]>(
      `*[_type == "video"] | order(date desc) { ${VIDEO_FIELDS} }`,
    );
    return Array.isArray(results) ? results : [];
  } catch (err) {
    console.error("Sanity getAllVideos error:", err);
    return [];
  }
}
