import { NextResponse } from "next/server";
import { fetchLiveScores } from "@/lib/api-tennis";

export async function GET() {
  try {
    const matches = await fetchLiveScores();
    return NextResponse.json(matches);
  } catch (err) {
    console.error("Live scores fetch failed:", err);
    console.error("Live scores fetch failed:", err);
    return NextResponse.json([]);
  }
}
