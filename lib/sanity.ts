import { createClient, type SanityClient } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImage } from "./sanity-image";
import { imageUrl } from "./sanity-image";
import type { Tournament, TournamentCategory, Surface } from "./types";
import { codeFromFlag, countryFromCode } from "./countries";
import { todayIso, slugify } from "./format";

// ─── Clients ─────────────────────────────────────────────────────────────────

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2024-01-01";

function token(): string | undefined {
  const t = process.env.SANITY_API_TOKEN;
  return t && t !== "[SENSITIVE]" ? t : undefined;
}

export function isSanityConfigured(): boolean {
  return Boolean(projectId);
}

let readClient: SanityClient | null = null;
function getClient(): SanityClient {
  readClient ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: token(),
    // never leak drafts to the public site, even when a token is configured
    perspective: "published",
  });
  return readClient;
}

let writeClient: SanityClient | null = null;
export function getWriteClient(): SanityClient {
  const t = token();
  if (!t) throw new Error("SANITY_API_TOKEN is not configured");
  writeClient ??= createClient({ projectId, dataset, apiVersion, useCdn: false, token: t, perspective: "published" });
  return writeClient;
}

interface FetchOpts {
  revalidate?: number | false;
  tags?: string[];
}

async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}, opts: FetchOpts = {}): Promise<T | null> {
  if (!isSanityConfigured()) return null;
  try {
    const { revalidate = 60, tags = [] } = opts;
    return await getClient().fetch<T>(query, params, revalidate === false ? { cache: "no-store" } : { next: { revalidate, tags } });
  } catch (err) {
    console.error("Sanity fetch error:", err);
    return null;
  }
}

// ─── Articles ────────────────────────────────────────────────────────────────

export interface SanityArticleCard {
  _id: string;
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  updatedAt?: string | null;
  readTime: number;
  mainImage?: SanityImage | null;
  featured?: boolean;
  author: string;
  authorRole?: string | null;
  articleSource?: string | null;
  tags?: string[] | null;
}

export interface SanityArticle extends SanityArticleCard {
  content: PortableTextBlock[];
  seoDescription?: string | null;
}

const CARD_FIELDS = `
  _id,
  "id": slug.current,
  title,
  excerpt,
  category,
  date,
  updatedAt,
  readTime,
  mainImage,
  featured,
  author,
  authorRole,
  articleSource,
  tags
`;

const ARTICLE_FIELDS = `${CARD_FIELDS}, content, seoDescription`;

function estimateReadTime(content: PortableTextBlock[] | undefined): number {
  if (!content?.length) return 1;
  let words = 0;
  for (const block of content as Array<{ _type?: string; children?: Array<{ text?: string }> }>) {
    if (block._type !== "block") continue;
    for (const child of block.children ?? []) words += (child.text ?? "").split(/\s+/).filter(Boolean).length;
  }
  return Math.max(1, Math.round(words / 200));
}

function normalizeCard<T extends SanityArticleCard>(a: T, content?: PortableTextBlock[]): T {
  return { ...a, readTime: a.readTime && a.readTime > 0 ? a.readTime : estimateReadTime(content), tags: a.tags ?? [] };
}

export async function getAllArticles(limit = 200): Promise<SanityArticleCard[]> {
  const res = await sanityFetch<SanityArticleCard[]>(
    `*[_type == "article" && defined(slug.current)] | order(date desc, _createdAt desc)[0...$limit] { ${CARD_FIELDS} }`,
    { limit },
    { revalidate: 60, tags: ["articles"] },
  );
  return (res ?? []).map((a) => normalizeCard(a));
}

export async function getArticleBySlug(slug: string): Promise<SanityArticle | null> {
  const res = await sanityFetch<SanityArticle | null>(
    `*[_type == "article" && slug.current == $slug][0] { ${ARTICLE_FIELDS} }`,
    { slug },
    { revalidate: 60, tags: ["articles", `article:${slug}`] },
  );
  if (!res) return null;
  return normalizeCard(res, res.content);
}

export async function getRelatedArticles(slug: string, tags: string[], category: string, limit = 3): Promise<SanityArticleCard[]> {
  const [byTag, byCategory] = await Promise.all([
    tags.length
      ? sanityFetch<SanityArticleCard[]>(
          `*[_type == "article" && slug.current != $slug && count((tags[])[@ in $tags]) > 0] | order(date desc)[0...6] { ${CARD_FIELDS} }`,
          { slug, tags },
          { revalidate: 300, tags: ["articles"] },
        )
      : Promise.resolve([]),
    sanityFetch<SanityArticleCard[]>(
      `*[_type == "article" && slug.current != $slug && category == $category] | order(date desc)[0...6] { ${CARD_FIELDS} }`,
      { slug, category },
      { revalidate: 300, tags: ["articles"] },
    ),
  ]);
  const seen = new Set<string>();
  const merged: SanityArticleCard[] = [];
  for (const a of [...(byTag ?? []), ...(byCategory ?? [])]) {
    if (seen.has(a._id)) continue;
    seen.add(a._id);
    merged.push(normalizeCard(a));
    if (merged.length >= limit) break;
  }
  return merged;
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const res = await sanityFetch<Array<{ slug: string }>>(
    `*[_type == "article" && defined(slug.current)]{ "slug": slug.current }`,
    {},
    { revalidate: 60, tags: ["articles"] },
  );
  return (res ?? []).map((r) => r.slug).filter(Boolean);
}

export interface TagSummary {
  tag: string;
  slug: string;
  count: number;
}

export async function getAllTags(): Promise<TagSummary[]> {
  const res = await sanityFetch<string[]>(
    `*[_type == "article" && defined(tags)].tags[]`,
    {},
    { revalidate: 300, tags: ["articles"] },
  );
  const counts = new Map<string, number>();
  for (const t of res ?? []) {
    if (!t) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, slug: slugify(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "pl"));
}

/** Resolve a URL slug ("iga-swiatek") back to the canonical tag ("Iga Świątek"). */
export async function resolveTag(slugOrTag: string): Promise<TagSummary | null> {
  const all = await getAllTags();
  const wanted = slugify(slugOrTag);
  return all.find((t) => t.slug === wanted) ?? null;
}

export async function getArticlesByTag(tag: string): Promise<SanityArticleCard[]> {
  const res = await sanityFetch<SanityArticleCard[]>(
    `*[_type == "article" && $tag in tags] | order(date desc)[0...100] { ${CARD_FIELDS} }`,
    { tag },
    { revalidate: 60, tags: ["articles"] },
  );
  return (res ?? []).map((a) => normalizeCard(a));
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface SanityComment {
  _id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export async function getApprovedComments(articleId: string): Promise<SanityComment[]> {
  const res = await sanityFetch<SanityComment[]>(
    `*[_type == "comment" && article._ref == $articleId && approved == true] | order(createdAt asc) { _id, authorName, body, createdAt }`,
    { articleId },
    { revalidate: false },
  );
  return res ?? [];
}

export async function getArticleIdBySlug(slug: string): Promise<string | null> {
  const res = await sanityFetch<{ _id: string } | null>(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug },
    { revalidate: 300, tags: ["articles"] },
  );
  return res?._id ?? null;
}

export async function countRecentCommentsByHash(ipHash: string, sinceIso: string): Promise<number> {
  const res = await sanityFetch<number>(
    `count(*[_type == "comment" && ipHash == $ipHash && createdAt > $since])`,
    { ipHash, since: sinceIso },
    { revalidate: false },
  );
  return res ?? 0;
}

export async function createComment(input: {
  articleId: string;
  authorName: string;
  body: string;
  ipHash: string;
  userAgent: string;
  approved: boolean;
}): Promise<SanityComment> {
  const client = getWriteClient();
  const createdAt = new Date().toISOString();
  const doc = await client.create({
    _type: "comment",
    article: { _type: "reference", _ref: input.articleId },
    authorName: input.authorName,
    body: input.body,
    createdAt,
    approved: input.approved,
    ipHash: input.ipHash,
    userAgent: input.userAgent.slice(0, 200),
  });
  return { _id: doc._id, authorName: input.authorName, body: input.body, createdAt };
}

// ─── Junior players (kept for the hidden /tenis-juniorski page) ──────────────

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

export async function getAllJuniorPlayers(tour: "Boys" | "Girls"): Promise<SanityJuniorPlayer[]> {
  const res = await sanityFetch<SanityJuniorPlayer[]>(
    `*[_type == "juniorPlayer" && tour == $tour] | order(rank asc) { _id, tour, rank, name, countryCode, points, pointsDiff, rankingDate }`,
    { tour },
    { revalidate: 300, tags: ["juniors"] },
  );
  return res ?? [];
}

// ─── Video ───────────────────────────────────────────────────────────────────

export interface SanityVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string | null;
  players?: string | null;
  tournament?: string | null;
  date?: string | null;
  duration?: string | null;
  category?: "Highlights" | "Full Match" | "Interview" | "Analysis" | null;
}

export async function getAllVideos(): Promise<SanityVideo[]> {
  const res = await sanityFetch<SanityVideo[]>(
    `*[_type == "video"] | order(date desc, _createdAt desc) { "id": _id, title, youtubeUrl, description, players, tournament, date, duration, category }`,
    {},
    { revalidate: 120, tags: ["videos"] },
  );
  return res ?? [];
}

// ─── Tournaments ─────────────────────────────────────────────────────────────

export interface SanityTournament {
  _id: string;
  name: string;
  location: string;
  country: string;
  countryCode?: string | null;
  flag?: string | null;
  surface: Surface;
  category: TournamentCategory;
  startDate: string;
  endDate: string;
  prize?: string | null;
  currentChampion?: string | null;
  pastWinners?: Array<{ year: number; name: string }> | null;
  image?: SanityImage | null;
  description?: string | null;
  website?: string | null;
  liveStreamUrl?: string | null;
  apiTournamentKey?: string | null;
}

export async function getAllTournaments(): Promise<SanityTournament[]> {
  const res = await sanityFetch<SanityTournament[]>(
    `*[_type == "tournament" && defined(startDate)] | order(startDate asc) {
      _id, name, location, country, countryCode, flag, surface, category,
      startDate, endDate, prize, currentChampion,
      pastWinners[] { year, name },
      image, description, website, liveStreamUrl, apiTournamentKey
    }`,
    {},
    { revalidate: 300, tags: ["tournaments"] },
  );
  return res ?? [];
}

export async function getTournamentById(id: string): Promise<SanityTournament | null> {
  return sanityFetch<SanityTournament | null>(
    `*[_type == "tournament" && _id == $id][0] {
      _id, name, location, country, countryCode, flag, surface, category,
      startDate, endDate, prize, currentChampion,
      pastWinners[] { year, name },
      image, description, website, liveStreamUrl, apiTournamentKey
    }`,
    { id },
    { revalidate: 300, tags: ["tournaments"] },
  );
}

const VALID_CATEGORIES: TournamentCategory[] = ["Grand Slam", "ATP Finals", "WTA Finals", "ATP 1000", "ATP 500", "ATP 250", "WTA 1000", "WTA 500", "WTA 250", "Inne"];
const VALID_SURFACES: Surface[] = ["Hard", "Clay", "Grass", "Indoor Hard"];

export function toTournament(t: SanityTournament, today = todayIso()): Tournament {
  let status: Tournament["status"] = "upcoming";
  if (t.startDate && t.endDate) {
    if (t.endDate < today) status = "completed";
    else if (t.startDate <= today) status = "live";
  }
  const code = t.countryCode || codeFromFlag(t.flag);
  const country = code ? countryFromCode(code) : null;
  return {
    id: t._id,
    name: t.name,
    location: t.location,
    country: t.country || country?.namePl || "",
    countryCode: country?.code ?? null,
    flag: country?.flag ?? t.flag ?? "",
    surface: VALID_SURFACES.includes(t.surface) ? t.surface : "Hard",
    category: VALID_CATEGORIES.includes(t.category) ? t.category : "Inne",
    startDate: t.startDate,
    endDate: t.endDate,
    prize: t.prize ?? undefined,
    status,
    currentChampion: t.currentChampion ?? undefined,
    pastWinners: t.pastWinners ?? undefined,
    imageUrl: imageUrl(t.image, 1200, 600),
    imageCredit: t.image?.credit ?? null,
    website: t.website ?? null,
    liveStreamUrl: t.liveStreamUrl ?? null,
    apiTournamentKey: t.apiTournamentKey ?? null,
    description: t.description ?? null,
  };
}

export async function getTournaments(): Promise<Tournament[]> {
  const raw = await getAllTournaments();
  const today = todayIso();
  return raw.map((t) => toTournament(t, today));
}

// ─── Pages (legal / info) ────────────────────────────────────────────────────

export interface SanityPage {
  _id: string;
  title: string;
  slug: string;
  body: PortableTextBlock[];
  order?: number | null;
}

export async function getFooterPages(): Promise<Array<Pick<SanityPage, "_id" | "title" | "slug">>> {
  const res = await sanityFetch<Array<Pick<SanityPage, "_id" | "title" | "slug">>>(
    `*[_type == "page" && showInFooter == true && defined(slug.current)] | order(order asc, title asc) { _id, title, "slug": slug.current }`,
    {},
    { revalidate: 300, tags: ["pages"] },
  );
  return res ?? [];
}

export async function getPageBySlug(slug: string): Promise<SanityPage | null> {
  return sanityFetch<SanityPage | null>(
    `*[_type == "page" && slug.current == $slug][0] { _id, title, "slug": slug.current, body, order }`,
    { slug },
    { revalidate: 300, tags: ["pages", `page:${slug}`] },
  );
}

export async function getAllPageSlugs(): Promise<string[]> {
  const res = await sanityFetch<Array<{ slug: string }>>(
    `*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`,
    {},
    { revalidate: 300, tags: ["pages"] },
  );
  return (res ?? []).map((r) => r.slug);
}

// ─── Site Settings ───────────────────────────────────────────────────────────

export interface SiteSettings {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  officeHours?: Array<{ day: string; hours: string; isOpen: boolean }> | null;
  responseTime?: string | null;
  footerDescription?: string | null;
  faqs?: Array<{ question: string; answer: string }> | null;
  logo?: SanityImage | null;
  logoUrl?: string | null;
  ogImage?: SanityImage | null;
  commentsEnabled?: boolean | null;
  commentsAutoApprove?: boolean | null;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const res = await sanityFetch<SiteSettings | null>(
    `*[_type == "siteSettings"][0] {
      email, phone, address, twitter, facebook, instagram, youtube,
      officeHours[] { day, hours, isOpen },
      responseTime, footerDescription,
      faqs[] { question, answer },
      logo, "logoUrl": logo.asset->url, ogImage,
      commentsEnabled, commentsAutoApprove
    }`,
    {},
    { revalidate: 120, tags: ["settings"] },
  );
  return res;
}
