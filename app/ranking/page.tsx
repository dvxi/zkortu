import type { Metadata } from "next";
import { Suspense } from "react";
import { ApiTennisError, describeApiError, fetchRankings } from "@/lib/api-tennis";
import type { Player } from "@/lib/types";
import { PageHeader } from "@/components/site/PageHeader";
import { SkeletonRows } from "@/components/site/States";
import { RankingExplorer, type RankingData } from "./RankingExplorer";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Ranking ATP i WTA",
  description: "Aktualny oficjalny ranking ATP i WTA: pełna lista zawodników, punkty, zmiany pozycji i flagi. Aktualizacja co poniedziałek.",
  alternates: { canonical: "/ranking" },
};

const INITIAL_ROWS = 100;

async function load(tour: "ATP" | "WTA"): Promise<{ players: Player[]; total: number; error: string | null }> {
  try {
    const players = await fetchRankings(tour);
    // only the first page is embedded in the HTML; the client fetches the full list on demand
    return { players: players.slice(0, INITIAL_ROWS), total: players.length, error: null };
  } catch (err) {
    (err instanceof ApiTennisError && err.code === "no-key" ? console.warn : console.error)(`[ranking page:${tour}]`, String(err));
    return { players: [], total: 0, error: describeApiError(err) };
  }
}

export default async function RankingPage() {
  const [atp, wta] = await Promise.all([load("ATP"), load("WTA")]);
  const data: RankingData = { ATP: atp, WTA: wta };
  const updatedAt = new Date().toISOString();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Oficjalne rankingi"
        title="Ranking ATP i WTA"
        description="Pełne listy rankingowe singlistów i singlistek. Dane publikowane przez ATP i WTA w każdy poniedziałek."
      />
      <Suspense fallback={<SkeletonRows rows={12} />}>
        <RankingExplorer data={data} updatedAt={updatedAt} />
      </Suspense>
    </div>
  );
}
