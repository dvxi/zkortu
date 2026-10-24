import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { COMMENT_LIMITS } from "@/lib/constants";
import {
  countRecentCommentsByHash,
  createComment,
  getApprovedComments,
  getArticleIdBySlug,
  getSiteSettings,
} from "@/lib/sanity";

export const dynamic = "force-dynamic";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

function hashIp(ip: string): string {
  const salt = process.env.COMMENT_SALT || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zkortu";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

// best-effort in-memory limiter (per serverless instance); Sanity count is the durable check
const recent = new Map<string, number[]>();
function hitLimiter(key: string): boolean {
  const now = Date.now();
  const windowMs = COMMENT_LIMITS.windowMinutes * 60_000;
  const list = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= COMMENT_LIMITS.perWindow) return true;
  list.push(now);
  recent.set(key, list);
  return false;
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function looksLikeSpam(body: string): boolean {
  const links = (body.match(/https?:\/\//gi) ?? []).length;
  if (links > 2) return true;
  if (/(.)\1{12,}/.test(body)) return true;
  return false;
}

// ─── GET: approved comments for an article ───────────────────────────────────

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("article")?.trim();
  if (!slug) return NextResponse.json({ error: "Brak parametru article" }, { status: 400 });

  const [settings, articleId] = await Promise.all([getSiteSettings(), getArticleIdBySlug(slug)]);
  if (!articleId) return NextResponse.json({ comments: [], enabled: false, error: "Nie znaleziono artykułu" }, { status: 404 });

  const enabled = settings?.commentsEnabled !== false;
  const comments = enabled ? await getApprovedComments(articleId) : [];
  return NextResponse.json({ comments, enabled, count: comments.length }, { headers: { "Cache-Control": "no-store" } });
}

// ─── POST: add a comment ─────────────────────────────────────────────────────

interface Body {
  article?: string;
  name?: string;
  body?: string;
  website?: string; // honeypot, must stay empty
  startedAt?: number; // form render timestamp (ms)
}

export async function POST(req: NextRequest) {
  let payload: Body;
  try {
    payload = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  // honeypot + timing (bots submit instantly)
  if (payload.website) return NextResponse.json({ ok: true, pending: true });
  if (typeof payload.startedAt === "number" && Date.now() - payload.startedAt < 2500) {
    return NextResponse.json({ error: "Zbyt szybko. Spróbuj ponownie." }, { status: 429 });
  }

  const slug = (payload.article ?? "").trim();
  const name = clean(payload.name ?? "");
  const body = (payload.body ?? "").trim();

  if (!slug) return NextResponse.json({ error: "Brak artykułu" }, { status: 400 });
  if (name.length < COMMENT_LIMITS.nameMin || name.length > COMMENT_LIMITS.nameMax) {
    return NextResponse.json({ error: `Podpis musi mieć od ${COMMENT_LIMITS.nameMin} do ${COMMENT_LIMITS.nameMax} znaków.` }, { status: 422 });
  }
  if (body.length < COMMENT_LIMITS.bodyMin || body.length > COMMENT_LIMITS.bodyMax) {
    return NextResponse.json({ error: `Komentarz musi mieć od ${COMMENT_LIMITS.bodyMin} do ${COMMENT_LIMITS.bodyMax} znaków.` }, { status: 422 });
  }
  if (looksLikeSpam(body)) return NextResponse.json({ error: "Komentarz wygląda na spam." }, { status: 422 });

  const [settings, articleId] = await Promise.all([getSiteSettings(), getArticleIdBySlug(slug)]);
  if (settings?.commentsEnabled === false) return NextResponse.json({ error: "Komentarze są wyłączone." }, { status: 403 });
  if (!articleId) return NextResponse.json({ error: "Nie znaleziono artykułu" }, { status: 404 });

  const ipHash = hashIp(clientIp(req));
  if (hitLimiter(ipHash)) return NextResponse.json({ error: "Za dużo komentarzy. Odczekaj chwilę." }, { status: 429 });
  const since = new Date(Date.now() - COMMENT_LIMITS.windowMinutes * 60_000).toISOString();
  const recentCount = await countRecentCommentsByHash(ipHash, since);
  if (recentCount >= COMMENT_LIMITS.perWindow) return NextResponse.json({ error: "Za dużo komentarzy. Odczekaj chwilę." }, { status: 429 });

  const approved = settings?.commentsAutoApprove === true;
  try {
    const comment = await createComment({
      articleId,
      authorName: name,
      body,
      ipHash,
      userAgent: req.headers.get("user-agent") ?? "",
      approved,
    });
    return NextResponse.json({ ok: true, pending: !approved, comment: approved ? comment : null }, { status: 201 });
  } catch (err) {
    console.error("[comments:create]", err);
    return NextResponse.json({ error: "Nie udało się zapisać komentarza. Spróbuj ponownie później." }, { status: 503 });
  }
}
