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
    useCdn: true,
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
    return await getClient().fetch(
      `*[_type == "article"] | order(date desc) { ${ARTICLE_FIELDS} }`,
      {},
      { next: { revalidate: 60 } },
    );
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  if (!isSanityConfigured()) return null;
  try {
    return await getClient().fetch(
      `*[_type == "article" && slug.current == $slug][0] { ${ARTICLE_FIELDS} }`,
      { slug },
      { next: { revalidate: 60 } },
    );
  } catch {
    return null;
  }
}

export async function getAllArticleSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) return [];
  try {
    const results: Array<{ slug: string }> = await getClient().fetch(
      `*[_type == "article"]{ "slug": slug.current }`,
      {},
      { next: { revalidate: 3600 } },
    );
    return results.map((r) => r.slug).filter(Boolean);
  } catch {
    return [];
  }
}
