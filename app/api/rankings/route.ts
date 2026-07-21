import { NextResponse } from "next/server";
import { fetchRankings } from "@/lib/api-tennis";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") === "WTA" ? "WTA" : "ATP";

  try {
    const players = await fetchRankings(type);
    return NextResponse.json(players);
  } catch (err) {
    console.error("Rankings fetch failed:", err);
    return NextResponse.json({ error: "Nie można pobrać danych" }, { status: 503 });
  }
}
