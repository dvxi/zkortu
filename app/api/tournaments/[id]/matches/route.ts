import { NextResponse } from "next/server";
import { ApiTennisError, describeApiError, fetchTournamentMatches } from "@/lib/api-tennis";
import { getTournamentById, toTournament } from "@/lib/sanity";

export const dynamic = "force-dynamic";

/** GET /api/tournaments/:id/matches — singles matches of a calendar tournament (API-Tennis fixtures). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const raw = await getTournamentById(id);
  if (!raw) return NextResponse.json({ matches: [], error: "Nie znaleziono turnieju" }, { status: 404 });
  const tournament = toTournament(raw);
  try {
    const matches = await fetchTournamentMatches(tournament);
    return NextResponse.json(
      { tournament: { id: tournament.id, name: tournament.name }, matches, count: matches.length, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } },
    );
  } catch (err) {
    console.error(`[tournament-matches:${id}]`, err);
    const code = err instanceof ApiTennisError ? err.code : "unknown";
    return NextResponse.json({ tournament: { id: tournament.id, name: tournament.name }, matches: [], error: describeApiError(err), code }, { status: 503 });
  }
}
