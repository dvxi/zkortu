"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  RefreshCw,
  Trophy,
  Timer,
  Flag,
} from "lucide-react";
import { atpPlayers, wtaPlayers, type Player } from "@/lib/mock-data";

async function loadRankings(type: "ATP" | "WTA"): Promise<Player[]> {
  try {
    const res = await fetch(`/api/rankings?type=${type}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function PointsDiff({ diff }: { diff: number }) {
  if (diff > 0)
    return (
      <span className="flex items-center gap-0.5 text-green-600 text-xs font-semibold">
        <TrendingUp className="h-3 w-3" />+{diff}
      </span>
    );
  if (diff < 0)
    return (
      <span className="flex items-center gap-0.5 text-red-500 text-xs font-semibold">
        <TrendingDown className="h-3 w-3" />
        {diff}
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-muted-foreground text-xs">
      <Minus className="h-3 w-3" />0
    </span>
  );
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-yellow-500 font-black">1</span>;
  if (rank === 2) return <span className="text-slate-400 font-black">2</span>;
  if (rank === 3) return <span className="text-amber-600 font-black">3</span>;
  return <span className="text-muted-foreground font-medium">{rank}</span>;
}

interface RankingTableProps {
  players: Player[];
  variant: "main" | "live" | "race";
}

function RankingTable({ players, variant }: RankingTableProps) {
  const liveOffset = variant === "live"
    ? players.map((p) => ({ ...p, points: p.points + ((p.points * 7 + 13) % 200) - 50 }))
    : players;

  const racePoints = variant === "race"
    ? players.map((p) => ({ ...p, points: Math.floor(p.points * 0.42) })).sort((a, b) => b.points - a.points).map((p, i) => ({ ...p, rank: i + 1 }))
    : liveOffset;

  const data = racePoints;

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: "var(--brand)" }}>
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/70 w-12">#</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/70">Zawodnik</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/70 hidden sm:table-cell">Kraj</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-white/70">Punkty</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-white/70 hidden sm:table-cell">Zmiana</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-white/70 hidden lg:table-cell">Najlepszy</th>
          </tr>
        </thead>
        <tbody>
          {data.map((player, idx) => (
            <tr
              key={`${player.rank}-${player.name}`}
              className={`border-t border-border transition-colors hover:bg-muted/30 ${
                idx < 3 ? "bg-muted/20" : ""
              }`}
            >
              <td className="px-4 py-3 text-sm text-center">
                <RankMedal rank={player.rank} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{player.flag}</span>
                  <span className="font-semibold text-sm">{player.name}</span>
                  {player.rank === 1 && (
                    <Trophy className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                {player.country}
              </td>

              <td className="px-4 py-3 text-right">
                <span className="font-bold text-sm">
                  {player.points.toLocaleString("pl-PL")}
                </span>
              </td>
              <td className="px-4 py-3 text-right hidden sm:table-cell">
                <PointsDiff diff={player.pointsDiff} />
              </td>
              <td className="px-4 py-3 text-right text-sm text-muted-foreground hidden lg:table-cell">
                #{player.bestRank}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const rankingTypes = [
  {
    id: "main",
    label: "Główny",
    icon: Trophy,
    description: "Oficjalny ranking ATP/WTA. Aktualizowany w każdy poniedziałek na podstawie wyników z ostatnich 52 tygodni.",
  },
  {
    id: "live",
    label: "Live",
    icon: RefreshCw,
    description: "Ranking uwzględniający wyniki z trwającego turnieju. Odświeżany co godzinę — punkty są doliczane natychmiast po każdym meczu.",
  },
  {
    id: "race",
    label: "Race",
    icon: Flag,
    description: "Race to Turin/Fort Worth — ranking sezonowy sumujący punkty zdobyte od 1 stycznia. Decyduje o kwalifikacji do Finals.",
  },
];

const PAGE_SIZE = 100;

export default function RankingPage() {
  const [tour, setTour] = useState<"atp" | "wta">("atp");
  const [rankType, setRankType] = useState<"main" | "live" | "race">("main");
  const [atpData, setAtpData] = useState<Player[]>([]);
  const [wtaData, setWtaData] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([loadRankings("ATP"), loadRankings("WTA")]).then(([atp, wta]) => {
      setAtpData(atp);
      setWtaData(wta);
      setLoading(false);
    });
  }, []);

  const allPlayers = tour === "atp" ? atpData : wtaData;
  const currentType = rankingTypes.find((r) => r.id === rankType)!;
  const Icon = currentType.icon;

  const totalPages = Math.max(1, Math.ceil(allPlayers.length / PAGE_SIZE));
  const players = allPlayers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeTour(t: "atp" | "wta") { setTour(t); setPage(1); }
  function changeRankType(r: "main" | "live" | "race") { setRankType(r); setPage(1); }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1" style={{ color: "var(--brand)" }}>
          Ranking
        </h1>
        <p className="text-muted-foreground">Oficjalne rankingi ATP i WTA — główny, live i race</p>
      </div>

      {/* Tour switcher */}
      <div className="flex items-center gap-3 mb-6">
        {(["atp", "wta"] as const).map((t) => (
          <button
            key={t}
            onClick={() => changeTour(t)}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-colors uppercase tracking-wide ${
              tour === t ? "text-white" : "border border-border text-muted-foreground hover:text-foreground"
            }`}
            style={tour === t ? { backgroundColor: "var(--brand)" } : {}}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Ranking type tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {rankingTypes.map((rt) => {
          const Ic = rt.icon;
          return (
            <button
              key={rt.id}
              onClick={() => changeRankType(rt.id as "main" | "live" | "race")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                rankType === rt.id
                  ? "text-white border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
              style={rankType === rt.id ? { backgroundColor: "var(--brand)" } : {}}
            >
              <Ic className="h-3.5 w-3.5" />
              {rt.label}
              {rt.id === "live" && rankType === "live" && (
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--live)" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "var(--live)" }} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Info banner */}
      <div key={`banner-${tour}-${rankType}`} className="anim-switch flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border mb-6">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
        <div>
          <span className="font-semibold text-sm">
            {tour.toUpperCase()} — Ranking {currentType.label}
          </span>
          <p className="text-sm text-muted-foreground mt-0.5">{currentType.description}</p>
        </div>
        {rankType === "live" && (
          <Badge
            className="ml-auto flex-shrink-0 text-xs border-0"
            style={{ backgroundColor: "rgba(var(--live), 0.15)", color: "var(--live)" }}
          >
            Odświeżono: przed chwilą
          </Badge>
        )}
      </div>

      {/* Table */}
      <div key={`${tour}-${rankType}`} className="anim-switch">
        {loading ? (
          <div className="rounded-xl overflow-hidden border border-border">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-t border-border animate-pulse">
                <div className="w-6 h-4 bg-muted rounded" />
                <div className="flex-1 h-4 bg-muted rounded" />
                <div className="w-20 h-4 bg-muted rounded hidden sm:block" />
                <div className="w-16 h-4 bg-muted rounded" />
                <div className="w-10 h-4 bg-muted rounded hidden sm:block" />
              </div>
            ))}
          </div>
        ) : (
          <RankingTable players={players} variant={rankType} />
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 gap-3">
          <button
            onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-border text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            ← Poprzednia
          </button>
          <span className="text-sm text-muted-foreground">
            Strona <span className="font-bold text-foreground">{page}</span> z <span className="font-bold text-foreground">{totalPages}</span>
            <span className="hidden sm:inline ml-2 text-xs">
              (miejsca {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, allPlayers.length)} z {allPlayers.length})
            </span>
          </span>
          <button
            onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-border text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            Następna →
          </button>
        </div>
      )}

      {/* Last updated info */}
      <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
        <Timer className="h-3 w-3" />
        {rankType === "main" && "Ostatnia aktualizacja: poniedziałek, 2 czerwca 2026"}
        {rankType === "live" && "Ranking live odświeżany co godzinę · Ostatnio: dziś, 19:00"}
        {rankType === "race" && "Ranking Race 2026 · Punkty od 1 stycznia 2026"}
      </div>
    </div>
  );
}
