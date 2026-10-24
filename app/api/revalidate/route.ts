import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Sanity → Next.js revalidation webhook.
 * Configure in sanity.io/manage → API → Webhooks:
 *   URL:     https://zkortu.pl/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>
 *   Trigger: create, update, delete
 *   Projection: { _type, "slug": slug.current }
 */
const TAGS_BY_TYPE: Record<string, string[]> = {
  article: ["articles"],
  tournament: ["tournaments"],
  video: ["videos"],
  page: ["pages"],
  siteSettings: ["settings"],
  juniorPlayer: ["juniors"],
};

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  const provided = req.nextUrl.searchParams.get("secret") ?? req.headers.get("x-sanity-secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  let body: { _type?: string; slug?: string | null } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body → revalidate everything below */
  }

  const tags = body._type ? (TAGS_BY_TYPE[body._type] ?? []) : Object.values(TAGS_BY_TYPE).flat();
  for (const tag of tags) revalidateTag(tag, "max");
  if (body._type === "article" && body.slug) {
    revalidateTag(`article:${body.slug}`, "max");
    revalidatePath(`/aktualnosci/${body.slug}`);
  }
  if (body._type === "page" && body.slug) revalidatePath(`/strona/${body.slug}`);
  revalidatePath("/");

  return NextResponse.json({ revalidated: true, type: body._type ?? "all", tags, at: new Date().toISOString() });
}
