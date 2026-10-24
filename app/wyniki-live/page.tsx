import type { Metadata } from "next";
import { fetchLiveScores } from "@/lib/api-tennis";
import type { LiveMatch } from "@/lib/types";
import { PageHeader } from "@/components/site/PageHeader";
import { LiveScoresClient } from "./LiveScoresClient";

export const revalidate = 30;

async function loadInitial(): Promise<LiveMatch[] | null> {
  try {
    return await fetchLiveScores("tour", { revalidate: 30, tags: ["live"] });
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: "Wyniki na żywo",
  description: "Wyniki meczów tenisowych na żywo: ATP, WTA, Challenger i ITF. Set po secie, aktualny gem, statystyki i plan dnia.",
  alternates: { canonical: "/wyniki-live" },
};

export default async function WynikiLivePage() {
  const initial = await loadInitial();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Na żywo"
        live
        title="Wyniki live"
        description="Mecze w trakcie oraz plan dnia. Wyniki odświeżają się automatycznie co 30 sekund."
      />
      <LiveScoresClient initial={initial} />
    </div>
  );
}
