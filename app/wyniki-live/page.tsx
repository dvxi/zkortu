import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { LiveScoresClient } from "./LiveScoresClient";

export const metadata: Metadata = {
  title: "Wyniki na żywo",
  description: "Wyniki meczów tenisowych na żywo: ATP, WTA, Challenger i ITF. Set po secie, aktualny gem, statystyki i plan dnia.",
  alternates: { canonical: "/wyniki-live" },
};

export default function WynikiLivePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Na żywo"
        live
        title="Wyniki live"
        description="Mecze w trakcie oraz plan dnia. Wyniki odświeżają się automatycznie co 30 sekund."
      />
      <LiveScoresClient />
    </div>
  );
}
