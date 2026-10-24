import { NextResponse } from "next/server";
import { ApiTennisError, describeApiError, fetchMatchesForDay } from "@/lib/api-tennis";
import { todayIso } from "@/lib/format";

export const dynamic = "force-dynamic";

/** GET /api/matches?date=YYYY-MM-DD&scope=tour|all — scheduled and finished matches for a day. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? todayIso();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ matches: [], error: "Nieprawidłowa data" }, { status: 400 });
  }
  const scope = searchParams.get("scope") === "all" ? "all" : "tour";
  try {
    const matches = await fetchMatchesForDay(date, scope);
    return NextResponse.json(
      { date, matches, count: matches.length, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } },
    );
  } catch (err) {
    console.error(`[matches:${date}]`, err);
    const code = err instanceof ApiTennisError ? err.code : "unknown";
    return NextResponse.json({ date, matches: [], error: describeApiError(err), code }, { status: 503 });
  }
}
