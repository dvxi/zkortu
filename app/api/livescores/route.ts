import { NextResponse } from "next/server";
import { ApiTennisError, describeApiError, fetchLiveScores } from "@/lib/api-tennis";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") === "all" ? "all" : "tour";
  try {
    const matches = await fetchLiveScores(scope);
    return NextResponse.json(
      { matches, count: matches.length, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[livescores]", err);
    const code = err instanceof ApiTennisError ? err.code : "unknown";
    return NextResponse.json({ matches: [], error: describeApiError(err), code }, { status: 503 });
  }
}
