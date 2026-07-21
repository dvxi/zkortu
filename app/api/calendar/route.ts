import { NextResponse } from "next/server";
import { fetchTournaments } from "@/lib/api-tennis";

export async function GET() {
  try {
    const tournaments = await fetchTournaments();
    return NextResponse.json(tournaments);
  } catch (err) {
    console.error("Calendar fetch failed:", err);
    return NextResponse.json({ error: "Nie można pobrać danych" }, { status: 503 });
  }
}
