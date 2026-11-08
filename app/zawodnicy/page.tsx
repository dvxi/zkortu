import type { Metadata } from "next";
import { fetchRankings } from "@/lib/api-tennis";
import { countryFromCode } from "@/lib/countries";
import { getAllPlayers } from "@/lib/sanity";
import type { Player } from "@/lib/types";
import { PageHeader } from "@/components/site/PageHeader";
import { EmptyState } from "@/components/site/States";
import { PlayersExplorer, type PlayerListItem } from "./PlayersExplorer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Zawodnicy: profile tenisistów i tenisistek",
  description: "Profile zawodników ATP i WTA: aktualny ranking, statystyki sezon po sezonie, tytuły, ostatnie mecze i wiadomości. Wszystkie Polki i Polacy z rankingu oraz czołowa setka.",
  alternates: { canonical: "/zawodnicy" },
};

async function rankIndex(): Promise<Map<string, number>> {
  const results = await Promise.allSettled([fetchRankings("ATP"), fetchRankings("WTA")]);
  const index = new Map<string, number>();
  for (const r of results) if (r.status === "fulfilled") for (const p of r.value as Player[]) index.set(p.playerKey, p.rank);
  return index;
}

export default async function PlayersPage() {
  const [players, ranks] = await Promise.all([getAllPlayers(), rankIndex()]);
  const items: PlayerListItem[] = players.map((p) => {
    const c = countryFromCode(p.countryCode);
    const countryName = c.namePl || (p.tour === "WTA" ? "Neutralna" : "Neutralny");
    return { slug: p.slug, name: p.name, tour: p.tour, countryCode: c.code ?? "", countryName, flag: c.flag, rank: ranks.get(p.apiPlayerKey) ?? null, photo: p.photo };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Profile" title="Zawodnicy" description="Polki i Polacy z rankingów ATP i WTA oraz czołowa setka obu tourów. Ranking, statystyki i mecze aktualizują się automatycznie." />
      {items.length === 0 ? (
        <EmptyState title="Profile zawodników w przygotowaniu" description="Pojawią się tutaj po dodaniu ich w panelu redakcji." />
      ) : (
        <PlayersExplorer players={items} />
      )}
    </div>
  );
}
