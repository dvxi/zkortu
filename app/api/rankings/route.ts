import { NextResponse } from "next/server";
import { ApiTennisError, describeApiError, fetchRankings } from "@/lib/api-tennis";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("tour") ?? searchParams.get("type") ?? "ATP").toUpperCase();
  const tour = raw === "WTA" ? "WTA" : "ATP";

  try {
    const players = await fetchRankings(tour);
    return NextResponse.json(
      { tour, players, count: players.length, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    console.error(`[rankings:${tour}]`, err);
    const code = err instanceof ApiTennisError ? err.code : "unknown";
    return NextResponse.json({ tour, players: [], error: describeApiError(err), code }, { status: 503 });
  }
}
