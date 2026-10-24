import { NextResponse } from "next/server";
import { getTournaments } from "@/lib/sanity";

export const revalidate = 300;

/** GET /api/calendar — curated tournament calendar from Sanity with computed status. */
export async function GET() {
  try {
    const tournaments = await getTournaments();
    return NextResponse.json({ tournaments, count: tournaments.length });
  } catch (err) {
    console.error("[calendar]", err);
    return NextResponse.json({ tournaments: [], error: "Nie można pobrać kalendarza" }, { status: 503 });
  }
}
