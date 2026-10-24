"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Info, Search, Timer } from "lucide-react";
import type { Player } from "@/lib/types";
import { formatDateTime, formatPoints, pluralPl } from "@/lib/format";
import { normalizeName } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/site/Badges";
import { Flag } from "@/components/site/Flag";
import { MovementIcon, RankNumber } from "@/components/site/RankingWidget";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/site/States";

export interface RankingData {
  ATP: { players: Player[]; total: number; error: string | null };
  WTA: { players: Player[]; total: number; error: string | null };
}

type Tour = "ATP" | "WTA";
const PAGE_SIZE = 100;

interface Props {
  data: RankingData;
  updatedAt: string;
}

export function RankingExplorer({ data, updatedAt }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourParam = (searchParams.get("tour") ?? "atp").toUpperCase();
  const tour: Tour = tourParam === "WTA" ? "WTA" : "ATP";

  const [query, setQuery] = useState("");
  const [onlyPoland, setOnlyPoland] = useState(false);
  // paging is keyed by the active filters, so any filter change implicitly resets to page 1
  const filterKey = `${tour}|${query}|${onlyPoland}`;
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;

  // full lists are fetched lazily (the HTML only carries the first page of each tour)
  const [full, setFull] = useState<Partial<Record<Tour, Player[]>>>({});
  const [fullError, setFullError] = useState<string | null>(null);
  useEffect(() => {
    if (full[tour] || data[tour].error) return;
    let active = true;
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/rankings?tour=${tour}`);
        const json = (await res.json()) as { players?: Player[]; error?: string };
        if (!active) return;
        if (res.ok && json.players) setFull((prev) => ({ ...prev, [tour]: json.players }));
        else setFullError(json.error ?? "Nie udało się pobrać pełnej listy.");
      } catch {
        if (active) setFullError("Nie udało się pobrać pełnej listy.");
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [tour, full, data]);

  const { error, total } = data[tour];
  const players = full[tour] ?? data[tour].players;
  const fullLoaded = Boolean(full[tour]);

  const filtered = useMemo(() => {
    const q = normalizeName(query);
    return players.filter((p) => {
      if (onlyPoland && p.countryCode !== "PL") return false;
      if (!q) return true;
      return normalizeName(p.name).includes(q) || normalizeName(p.country).includes(q);
    });
  }, [players, query, onlyPoland]);

  const isFiltering = Boolean(query) || onlyPoland;
  const listLength = fullLoaded || isFiltering ? filtered.length : total;
  const totalPages = Math.max(1, Math.ceil(listLength / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const polesCount = players.filter((p) => p.countryCode === "PL").length;

  function changeTour(next: Tour) {
    router.replace(next === "ATP" ? "/ranking" : "/ranking?tour=wta", { scroll: false });
  }

  function changePage(next: number) {
    setPageState({ key: filterKey, page: Math.min(Math.max(1, next), totalPages) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex rounded-xl border border-border bg-card p-1" role="tablist" aria-label="Wybór cyklu">
          {(["ATP", "WTA"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tour === t}
              onClick={() => changeTour(t)}
              className={cn(
                "rounded-lg px-6 py-2 text-sm font-black tracking-wide transition-colors",
                tour === t ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Szukaj zawodnika lub kraju</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj zawodnika lub kraju…"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand/50"
            />
          </label>
          <Chip active={onlyPoland} onClick={() => setOnlyPoland((v) => !v)} tone="brand" className="h-10 justify-center px-4">
            🇵🇱 Tylko Polacy {polesCount > 0 && <span className="opacity-70">({polesCount})</span>}
          </Chip>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-strong" />
        <p className="text-muted-foreground">
          <span className="font-semibold text-ink">Ranking {tour}</span>: oficjalna klasyfikacja singlowa z ostatnich 52 tygodni.
          Strzałka w kolumnie „Zmiana” pokazuje kierunek ruchu względem poprzedniego notowania.
        </p>
      </div>

      {error ? (
        <ErrorState title="Ranking jest chwilowo niedostępny" description={error} />
      ) : players.length === 0 ? (
        <EmptyState title="Brak danych rankingowych" description="Spróbuj ponownie za kilka minut." />
      ) : filtered.length === 0 ? (
        <EmptyState title={fullLoaded ? "Nie znaleziono zawodników" : "Wczytywanie pełnej listy…"} description={fullLoaded ? "Zmień zapytanie lub wyłącz filtr." : fullError ?? "Wyszukiwanie obejmie wszystkich zawodników za chwilę."} />
      ) : rows.length === 0 ? (
        <SkeletonRows rows={10} />
      ) : (
        <div key={`${tour}-${current}`} className="anim-switch overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full">
            <caption className="sr-only">Ranking {tour}, strona {current} z {totalPages}</caption>
            <thead>
              <tr className="bg-ink text-left text-[11px] font-bold uppercase tracking-wider text-ink-foreground/70">
                <th scope="col" className="w-14 px-4 py-3 text-center">#</th>
                <th scope="col" className="px-3 py-3">Zawodnik</th>
                <th scope="col" className="hidden px-3 py-3 md:table-cell">Kraj</th>
                <th scope="col" className="px-3 py-3 text-right">Punkty</th>
                <th scope="col" className="w-20 px-3 py-3 text-center">Zmiana</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const isPole = p.countryCode === "PL";
                return (
                  <tr
                    key={`${p.rank}-${p.playerKey}`}
                    className={cn(
                      "border-t border-border transition-colors hover:bg-muted/40",
                      p.rank <= 3 && "bg-brand-soft/50",
                      isPole && "bg-brand-soft/30",
                    )}
                  >
                    <td className="px-4 py-2.5 text-center text-sm">
                      <RankNumber rank={p.rank} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Flag flag={p.flag} country={p.country} className="w-5 text-center text-lg" />
                        <span className="text-sm font-semibold text-ink">{p.name}</span>
                        {isPole && <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-black uppercase text-brand-foreground">PL</span>}
                      </div>
                    </td>
                    <td className="hidden px-3 py-2.5 text-sm text-muted-foreground md:table-cell">{p.country}</td>
                    <td className="tabular px-3 py-2.5 text-right text-sm font-bold text-ink">{formatPoints(p.points)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-center">
                        <MovementIcon movement={p.movement} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!error && totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Stronicowanie rankingu">
          <button
            onClick={() => changePage(current - 1)}
            disabled={current === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Poprzednia
          </button>
          <span className="text-sm text-muted-foreground">
            Strona <span className="font-bold text-ink">{current}</span> z <span className="font-bold text-ink">{totalPages}</span>
            <span className="ml-2 hidden text-xs sm:inline">
              (miejsca {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, listLength)} z {listLength})
            </span>
          </span>
          <button
            onClick={() => changePage(current + 1)}
            disabled={current === totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Następna <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Timer className="h-3 w-3" />
        {listLength > 0 && `${listLength} ${pluralPl(listLength, "zawodnik", "zawodników", "zawodników")} · `}
        Dane: oficjalny ranking {tour} · odświeżono {formatDateTime(updatedAt)}
      </p>
    </div>
  );
}
