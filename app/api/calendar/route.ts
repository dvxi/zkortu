import { NextResponse } from "next/server";
import { getAllTournaments } from "@/lib/sanity";
import type { Tournament } from "@/lib/mock-data";

export const revalidate = 3600;

export async function GET() {
  try {
    const raw = await getAllTournaments();
    if (!raw.length) return NextResponse.json([]);

    const now = new Date().toISOString().slice(0, 10);

    const tournaments: Tournament[] = raw.map((t) => {
      let status: Tournament["status"] = "upcoming";
      if (t.startDate && t.endDate) {
        if (t.endDate < now) status = "completed";
        else if (t.startDate <= now) status = "live";
      }
      return {
        id: t._id,
        name: t.name,
        location: t.location,
        country: t.country,
        flag: t.flag ?? "🏆",
        surface: t.surface,
        category: t.category,
        startDate: t.startDate,
        endDate: t.endDate,
        prize: t.prize ?? "",
        status,
        currentChampion: t.currentChampion,
        pastWinners: t.pastWinners,
        imageQuery: t.imageQuery ?? `tennis tournament ${t.name}`,
        liveStreamUrl: t.liveStreamUrl,
      };
    });

    return NextResponse.json(tournaments);
  } catch (err) {
    console.error("Calendar fetch failed:", err);
    return NextResponse.json([]);
  }
}
