"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, RefreshCw, Trophy } from "lucide-react";
import type { LiveMatch, Tour } from "@/lib/types";
import { todayIso, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Chip, MatchStatusBadge, SurfaceBadge, TourBadge } from "@/components/site/Badges";
import { Flag } from "@/components/site/Flag";
import { MatchRow } from "@/components/site/MatchRow";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/site/States";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type StatusFilter = "all" | "live" | "upcoming" | "finished";
type TourFilter = "all" | "ATP" | "WTA" | "other";

const POLL_LIVE_MS = 30_000;
const POLL_DAY_MS = 120_000;

interface ApiMatches {
  matches?: LiveMatch[];
  error?: string;
}

function mergeMatches(live: LiveMatch[], day: LiveMatch[]): LiveMatch[] {
  const byId = new Map<string, LiveMatch>();
  for (const m of day) byId.set(m.id, m);
  for (const m of live) byId.set(m.id, m);
  return Array.from(byId.values());
}

function tourFilterMatch(m: LiveMatch, f: TourFilter): boolean {
  if (f === "all") return true;
  if (f === "other") return m.tour !== "ATP" && m.tour !== "WTA";
  return m.tour === f;
}

type NumericStatKey = "aces" | "doubleFaults" | "firstServePct" | "firstServeWon" | "secondServeWon" | "winners" | "unforcedErrors" | "totalPointsWon";
type RatioStatKey = "breakPoints" | "breakPointsSaved";

const STAT_LABELS: Array<{ key: NumericStatKey; label: string; pct?: boolean }> = [
  { key: "aces", label: "Asy" },
  { key: "doubleFaults", label: "Podwójne błędy" },
  { key: "firstServePct", label: "Skuteczność 1. serwisu", pct: true },
  { key: "firstServeWon", label: "Punkty po 1. serwisie", pct: true },
  { key: "secondServeWon", label: "Punkty po 2. serwisie", pct: true },
  { key: "winners", label: "Winnery" },
  { key: "unforcedErrors", label: "Niewymuszone błędy" },
  { key: "totalPointsWon", label: "Wygrane punkty" },
];

const RATIO_LABELS: Array<{ key: RatioStatKey; label: string }> = [
  { key: "breakPoints", label: "Wykorzystane break pointy" },
  { key: "breakPointsSaved", label: "Obronione break pointy" },
];

function ratioParts(v: string): { won: number; total: number } {
  const m = v.match(/^(\d+)\/(\d+)$/);
  return m ? { won: Number(m[1]), total: Number(m[2]) } : { won: parseInt(v, 10) || 0, total: 0 };
}

function StatBar({ label, v1, v2, pct, display }: { label: string; v1: number; v2: number; pct?: boolean; display?: [string, string] }) {
  const total = v1 + v2 || 1;
  const p1 = pct ? v1 : Math.round((v1 / total) * 100);
  const p2 = pct ? v2 : 100 - p1;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold">
        <span className="tabular">{display ? display[0] : `${v1}${pct ? "%" : ""}`}</span>
        <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
        <span className="tabular">{display ? display[1] : `${v2}${pct ? "%" : ""}`}</span>
      </div>
      <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
        <div className="flex flex-1 justify-end rounded-l-full bg-muted">
          <div className="anim-grow-x h-full rounded-l-full bg-ink" style={{ width: `${pct ? v1 : p1}%` }} />
        </div>
        <div className="flex flex-1 rounded-r-full bg-muted">
          <div className="anim-grow-x h-full rounded-r-full bg-brand" style={{ width: `${pct ? v2 : p2}%` }} />
        </div>
      </div>
    </div>
  );
}

function MatchDetail({ match }: { match: LiveMatch }) {
  const stats = match.stats;
  const statRows = stats ? STAT_LABELS.filter((s) => stats[s.key]) : [];
  const ratioRows = stats ? RATIO_LABELS.filter((s) => stats[s.key]) : [];
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="bg-ink p-5 text-ink-foreground">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TourBadge tour={match.tour} />
            {match.surface && <SurfaceBadge surface={match.surface} />}
            <span className="text-xs text-white/60">
              {match.tournament}
              {match.round ? ` · ${match.round}` : ""}
              {match.isDoubles ? " · debel" : ""}
            </span>
          </div>
          <MatchStatusBadge status={match.status} label={match.statusLabel} time={match.time} className="text-white/80" />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {[match.player1, match.player2].map((p, i) => {
            const side = (i + 1) as 1 | 2;
            return (
              <div key={side} className={cn("min-w-0 text-center", side === 1 ? "text-left sm:text-center" : "text-right sm:text-center")}>
                <div className="mb-1 text-2xl"><Flag flag={p.flag} country={p.countryCode} /></div>
                <p className={cn("text-balance text-base font-black leading-tight sm:text-lg", match.winner && match.winner !== side && "opacity-60")}>{p.name}</p>
                {match.status === "live" && match.server === side && <span className="mt-1 inline-block text-[11px] font-bold text-brand">● serwuje</span>}
                {match.winner === side && <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-brand"><Trophy className="h-3 w-3" /> zwycięzca</span>}
              </div>
            );
          })}
          <div className="col-start-2 row-start-1 flex flex-col items-center">
            {match.sets.length > 0 ? (
              <div className="flex gap-2">
                {match.sets.map((s, i) => (
                  <div key={i} className="tabular text-center">
                    <div className={cn("text-2xl font-black", s.p1 > s.p2 ? "text-white" : "text-white/55")}>{s.p1}</div>
                    <div className="text-xs text-white/30">set {i + 1}</div>
                    <div className={cn("text-2xl font-black", s.p2 > s.p1 ? "text-white" : "text-white/55")}>{s.p2}</div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-white/55">{match.status === "upcoming" ? "Mecz nierozpoczęty" : "Brak wyniku"}</span>
            )}
            {match.status === "live" && match.currentGame && (
              <span className="tabular mt-2 rounded-full bg-brand px-3 py-1 text-sm font-black text-brand-foreground">{match.currentGame}</span>
            )}
            {match.status === "upcoming" && match.time && (
              <span className="mt-2 inline-flex items-center gap-1 text-sm text-white/70"><Clock className="h-4 w-4" /> {match.time}</span>
            )}
          </div>
        </div>
      </div>

      {match.sets.length > 0 && (
        <div className="border-b border-border p-5">
          <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Sety</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-muted-foreground">
                <th className="pb-2 text-left font-semibold">Zawodnik</th>
                {match.sets.map((_, i) => <th key={i} className="w-12 pb-2 text-center font-semibold">S{i + 1}</th>)}
                {match.status === "live" && <th className="w-12 pb-2 text-center font-semibold">Gem</th>}
              </tr>
            </thead>
            <tbody>
              {[match.player1, match.player2].map((p, i) => {
                const side = (i + 1) as 1 | 2;
                const game = match.currentGame.split(/\s*-\s*/)[i];
                return (
                  <tr key={side} className="border-t border-border">
                    <td className="py-2 font-semibold"><Flag flag={p.flag} country={p.countryCode} className="mr-2" />{p.name}</td>
                    {match.sets.map((s, si) => {
                      const v = side === 1 ? s.p1 : s.p2;
                      const won = side === 1 ? s.p1 > s.p2 : s.p2 > s.p1;
                      return <td key={si} className={cn("tabular py-2 text-center", won ? "font-black" : "text-muted-foreground")}>{v}</td>;
                    })}
                    {match.status === "live" && <td className="tabular py-2 text-center font-black text-brand-strong">{game ?? ""}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(statRows.length > 0 || ratioRows.length > 0) && stats && (
        <div className="p-5">
          <h3 className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Statystyki meczu</h3>
          <div className="mb-3 flex justify-between text-sm font-bold">
            <span className="text-ink">{match.player1.name}</span>
            <span className="text-brand-strong">{match.player2.name}</span>
          </div>
          <div className="space-y-4">
            {statRows.map((s) => {
              const v = stats[s.key]!;
              return <StatBar key={s.key} label={s.label} v1={v[0]} v2={v[1]} pct={s.pct} />;
            })}
            {ratioRows.map((s) => {
              const v = stats[s.key]!;
              const a = ratioParts(v[0]);
              const b = ratioParts(v[1]);
              return <StatBar key={s.key} label={s.label} v1={a.won} v2={b.won} display={[v[0], v[1]]} />;
            })}
          </div>
        </div>
      )}

      {statRows.length === 0 && ratioRows.length === 0 && match.status !== "upcoming" && (
        <p className="p-5 text-center text-sm text-muted-foreground">Statystyki tego meczu nie są dostępne.</p>
      )}
      {match.status === "upcoming" && (
        <div className="p-8 text-center text-muted-foreground">
          <Clock className="mx-auto mb-3 h-8 w-8 opacity-40" />
          <p className="font-medium text-ink">Mecz rozpocznie się {match.time ? `o ${match.time}` : "wkrótce"}</p>
          <p className="mt-1 text-sm">Wynik i statystyki pojawią się po rozpoczęciu.</p>
        </div>
      )}
    </div>
  );
}

export function LiveScoresClient({ initial = null }: { initial?: LiveMatch[] | null }) {
  const [live, setLive] = useState<LiveMatch[] | null>(initial);
  const [day, setDay] = useState<LiveMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(initial === null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [tourFilter, setTourFilter] = useState<TourFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const scope = showAll ? "all" : "tour";

  const loadLive = useCallback(async () => {
    try {
      const res = await fetch(`/api/livescores?scope=${scope}`, { cache: "no-store" });
      const data = (await res.json()) as ApiMatches;
      if (!res.ok) {
        setError(data.error ?? "Dane są chwilowo niedostępne.");
        return;
      }
      setError(null);
      setLive(data.matches ?? []);
      setUpdatedAt(new Date());
    } catch {
      setError("Nie udało się pobrać wyników.");
    }
  }, [scope]);

  const loadDay = useCallback(async () => {
    try {
      const res = await fetch(`/api/matches?date=${todayIso()}&scope=${scope}`);
      if (!res.ok) return;
      const data = (await res.json()) as ApiMatches;
      setDay(data.matches ?? []);
    } catch {
      /* day schedule is optional */
    }
  }, [scope]);

  useEffect(() => {
    let active = true;
    // initial load is deferred so the effect body itself never touches state
    const initial = setTimeout(() => {
      // render as soon as the live feed answers; the day schedule merges in when it arrives
      loadLive().finally(() => active && setLoading(false));
      loadDay();
    }, 0);
    const a = setInterval(loadLive, POLL_LIVE_MS);
    const b = setInterval(loadDay, POLL_DAY_MS);
    return () => {
      active = false;
      clearTimeout(initial);
      clearInterval(a);
      clearInterval(b);
    };
  }, [loadLive, loadDay]);

  const matches = useMemo(() => mergeMatches(live ?? [], day), [live, day]);
  const liveCount = matches.filter((m) => m.status === "live").length;

  const visible = useMemo(() => {
    return matches
      .filter((m) => tourFilterMatch(m, tourFilter))
      .filter((m) => (status === "all" ? true : m.status === status))
      .sort((a, b) => {
        const order = { live: 0, upcoming: 1, finished: 2, cancelled: 3 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
      });
  }, [matches, tourFilter, status]);

  const grouped = useMemo(() => {
    const map = new Map<string, LiveMatch[]>();
    for (const m of visible) {
      const list = map.get(m.tournament) ?? [];
      list.push(m);
      map.set(m.tournament, list);
    }
    return Array.from(map.entries());
  }, [visible]);

  const selected = visible.find((m) => m.id === selectedId) ?? visible[0] ?? null;

  function select(id: string) {
    setSelectedId(id);
    if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches) setSheetOpen(true);
  }

  async function refresh() {
    setRefreshing(true);
    await Promise.all([loadLive(), loadDay()]);
    setRefreshing(false);
  }

  const toursPresent = useMemo(() => new Set<Tour>(matches.map((m) => m.tour)), [matches]);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={status === "all"} onClick={() => setStatus("all")}>Wszystkie</Chip>
          <Chip active={status === "live"} onClick={() => setStatus("live")} tone="brand">
            <span className="live-dot" aria-hidden="true" /> Na żywo {liveCount > 0 && <span className="opacity-70">({liveCount})</span>}
          </Chip>
          <Chip active={status === "upcoming"} onClick={() => setStatus("upcoming")}>Nadchodzące</Chip>
          <Chip active={status === "finished"} onClick={() => setStatus("finished")}>Zakończone</Chip>
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <Chip active={tourFilter === "all"} onClick={() => setTourFilter("all")}>ATP + WTA</Chip>
          <Chip active={tourFilter === "ATP"} onClick={() => setTourFilter("ATP")}>ATP</Chip>
          <Chip active={tourFilter === "WTA"} onClick={() => setTourFilter("WTA")}>WTA</Chip>
          {(showAll || toursPresent.has("Challenger") || toursPresent.has("ITF")) && (
            <Chip active={tourFilter === "other"} onClick={() => setTourFilter("other")}>Challenger / ITF</Chip>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
            pokaż też Challenger i ITF
          </label>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-ink"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            {updatedAt ? `Odświeżono ${updatedAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : "Odśwież"}
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonRows rows={8} />
      ) : error && matches.length === 0 ? (
        <ErrorState title="Wyniki są chwilowo niedostępne" description={error} action={<button onClick={refresh} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-ink-foreground">Spróbuj ponownie</button>} />
      ) : visible.length === 0 ? (
        <EmptyState
          title={status === "live" ? "W tej chwili nie trwa żaden mecz" : "Brak meczów dla wybranych filtrów"}
          description={status === "live" ? `Plan dnia (${formatDate(todayIso(), { day: "numeric", month: "long" })}) znajdziesz w zakładce „Nadchodzące”.` : "Zmień filtry lub włącz Challenger i ITF."}
          icon={<Clock className="h-5 w-5" />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Match list */}
          <div className="space-y-6 lg:col-span-2">
            {error && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{error} Pokazujemy ostatni dostępny stan.</p>}
            {grouped.map(([tournament, list]) => (
              <section key={tournament} aria-label={tournament}>
                <h2 className="mb-2 flex items-center gap-2 px-1 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                  <TourBadge tour={list[0].tour} /> {tournament}
                </h2>
                <div className="space-y-2">
                  {list.map((m) => {
                    const isSelected = selected?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        data-match={m.id}
                        onClick={() => select(m.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          "w-full rounded-xl border p-3.5 text-left transition-all",
                          isSelected ? "border-ink bg-ink text-ink-foreground shadow-md" : "border-border bg-card hover:border-ink/30",
                        )}
                      >
                        <MatchRow match={m} selected={isSelected} />
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Desktop detail */}
          <div className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              {selected && <div key={selected.id} className="anim-switch"><MatchDetail match={selected} /></div>}
            </div>
          </div>
        </div>
      )}

      {/* Mobile detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-2xl p-4 lg:hidden">
          <SheetTitle className="sr-only">Szczegóły meczu</SheetTitle>
          {selected && <MatchDetail match={selected} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
