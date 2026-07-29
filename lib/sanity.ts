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

// ── Junior Players ────────────────────────────────────────────────────────────

export interface SanityJuniorPlayer {
  _id: string;
  tour: "Boys" | "Girls";
  rank: number;
  name: string;
  countryCode: string;
  points: number;
  pointsDiff: number;
  rankingDate: string;
}

const JUNIOR_COUNTRY_PL: Record<string, string> = {
  AL: "Albania", AR: "Argentyna", AU: "Australia", AT: "Austria",
  BE: "Belgia", BY: "Białoruś", BR: "Brazylia", BG: "Bułgaria",
  CL: "Chile", CN: "Chiny", HR: "Chorwacja", CZ: "Czechy",
  DK: "Dania", FI: "Finlandia", FR: "Francja", GR: "Grecja",
  ES: "Hiszpania", NL: "Holandia", HK: "Hong Kong", IN: "Indie",
  JP: "Japonia", CA: "Kanada", KZ: "Kazachstan", KR: "Korea Południowa",
  MX: "Meksyk", DE: "Niemcy", NO: "Norwegia", PL: "Polska",
  PT: "Portugalia", RU: "Rosja", RO: "Rumunia", RS: "Serbia",
  SK: "Słowacja", CH: "Szwajcaria", SE: "Szwecja", TW: "Tajwan",
  UA: "Ukraina", US: "USA", HU: "Węgry", GB: "Wielka Brytania", IT: "Włochy",
};

const JUNIOR_FLAG: Record<string, string> = {
  AL: "🇦🇱", AR: "🇦🇷", AU: "🇦🇺", AT: "🇦🇹", BE: "🇧🇪", BY: "🇧🇾",
  BR: "🇧🇷", BG: "🇧🇬", CL: "🇨🇱", CN: "🇨🇳", HR: "🇭🇷", CZ: "🇨🇿",
  DK: "🇩🇰", FI: "🇫🇮", FR: "🇫🇷", GR: "🇬🇷", ES: "🇪🇸", NL: "🇳🇱",
  HK: "🇭🇰", IN: "🇮🇳", JP: "🇯🇵", CA: "🇨🇦", KZ: "🇰🇿", KR: "🇰🇷",
  MX: "🇲🇽", DE: "🇩🇪", NO: "🇳🇴", PL: "🇵🇱", PT: "🇵🇹", RU: "🇷🇺",
  RO: "🇷🇴", RS: "🇷🇸", SK: "🇸🇰", CH: "🇨🇭", SE: "🇸🇪", TW: "🇹🇼",
  UA: "🇺🇦", US: "🇺🇸", HU: "🇭🇺", GB: "🇬🇧", IT: "🇮🇹",
};

export function juniorToPlayer(p: SanityJuniorPlayer) {
  return {
    rank: p.rank,
    name: p.name,
    country: JUNIOR_COUNTRY_PL[p.countryCode] ?? p.countryCode,
    flag: JUNIOR_FLAG[p.countryCode] ?? "🏳️",
    points: p.points,
    pointsDiff: p.pointsDiff ?? 0,
    age: 0,
    bestRank: p.rank,
  };
}

export async function getAllJuniorPlayers(tour: "Boys" | "Girls"): Promise<SanityJuniorPlayer[]> {
  if (!isSanityConfigured()) return [];
  try {
    const results = await getClient().fetch<SanityJuniorPlayer[]>(
      `*[_type == "juniorPlayer" && tour == $tour] | order(rank asc) { _id, tour, rank, name, countryCode, points, pointsDiff, rankingDate }`,
      { tour },
    );
    return Array.isArray(results) ? results : [];
  } catch (err) {
    console.error("Sanity getAllJuniorPlayers error:", err);
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

// ── Site Settings ─────────────────────────────────────────────────────────────

export interface SiteSettings {
  email?: string;
  phone?: string;
  address?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  officeHours?: Array<{ day: string; hours: string; isOpen: boolean }>;
  responseTime?: string;
  footerDescription?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!isSanityConfigured()) return null;
  try {
    return await getClient().fetch<SiteSettings | null>(
      `*[_type == "siteSettings"][0] {
        email, phone, address,
        twitter, facebook, instagram,
        officeHours[] { day, hours, isOpen },
        responseTime, footerDescription,
        faqs[] { question, answer }
      }`,
    );
  } catch (err) {
    console.error("Sanity getSiteSettings error:", err);
    return null;
  }
}
