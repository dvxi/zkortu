"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  List,
  MapPin,
  PlayCircle,
  Trophy,
} from "lucide-react";
import type { LiveMatch, Tournament, TournamentStatus } from "@/lib/types";
import { surfaceDotColors, surfaceLabels } from "@/lib/types";
import { formatDate, formatDateRange, formatDateShort, parseIsoDate, todayIso } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CategoryBadge, Chip, LiveBadge, SurfaceBadge } from "@/components/site/Badges";
import { Flag } from "@/components/site/Flag";
import { ImagePlaceholder } from "@/components/site/ImagePlaceholder";
import { MatchRow } from "@/components/site/MatchRow";
import { EmptyState } from "@/components/site/States";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const DAYS_PL = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const MONTHS_PL = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

type View = "calendar" | "list";
type StatusFilter = "all" | TournamentStatus;
type TourFilter = "all" | "ATP" | "WTA" | "Grand Slam";

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function onDay(t: Tournament, date: string) {
  return date >= t.startDate && date <= t.endDate;
}

function matchesTour(t: Tournament, f: TourFilter) {
  if (f === "all") return true;
  if (f === "Grand Slam") return t.category === "Grand Slam";
  return t.category.startsWith(f) || t.category === "Grand Slam";
}

interface MatchesState {
  loading: boolean;
  matches: LiveMatch[];
  error: string | null;
}

interface KeyedMatches {
  key: string | null;
  matches: LiveMatch[];
  error: string | null;
}

/** Fetch matches for a request key; `loading` is derived from whether the stored key matches. */
function useMatches(key: string | null, url: string | null): MatchesState {
  const [state, setState] = useState<KeyedMatches>({ key: null, matches: [], error: null });
  useEffect(() => {
    if (!key || !url) return;
    let active = true;
    fetch(url)
      .then(async (r) => {
        const data = (await r.json()) as { matches?: LiveMatch[]; error?: string };
        if (!active) return;
        setState({ key, matches: data.matches ?? [], error: r.ok ? null : (data.error ?? "Brak danych") });
      })
      .catch(() => active && setState({ key, matches: [], error: "Brak danych" }));
    return () => {
      active = false;
    };
  }, [key, url]);
  if (!key) return { loading: false, matches: [], error: null };
  if (state.key !== key) return { loading: true, matches: [], error: null };
  return { loading: false, matches: state.matches, error: state.error };
}

function useDayMatches(date: string): MatchesState {
  return useMatches(date, `/api/matches?date=${date}&scope=tour`);
}

function useTournamentMatches(id: string | null): MatchesState {
  return useMatches(id, id ? `/api/tournaments/${encodeURIComponent(id)}/matches` : null);
}

function TournamentListItem({ t, onClick }: { t: Tournament; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group w-full text-left">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3.5 transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md">
        <div className="relative hidden h-16 w-28 shrink-0 overflow-hidden rounded-lg sm:block">
          {t.imageUrl ? <Image src={t.imageUrl} alt={t.name} fill sizes="112px" className="object-cover" /> : <ImagePlaceholder surface={t.surface} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={t.category} />
            <SurfaceBadge surface={t.surface} />
            {t.status === "live" && <LiveBadge />}
            {t.status === "completed" && <span className="text-[11px] font-semibold text-muted-foreground">Zakończony</span>}
          </div>
          <h3 className="flex items-center gap-2 truncate text-sm font-bold text-ink">
            <Flag flag={t.flag} country={t.country} />
            {t.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{t.location}{t.country ? `, ${t.country}` : ""}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDateShort(t.startDate)} – {formatDateShort(t.endDate)}</span>
            {t.prize && <span className="inline-flex items-center gap-1"><Trophy className="h-3 w-3" />{t.prize}</span>}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-ink" />
      </div>
    </button>
  );
}

function MatchList({ state, emptyText }: { state: MatchesState; emptyText: string }) {
  if (state.loading) {
    return (
      <div className="space-y-2" aria-hidden="true">
        {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
      </div>
    );
  }
  if (state.error) return <p className="text-sm text-muted-foreground">{state.error}</p>;
  if (state.matches.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  const byRound = new Map<string, LiveMatch[]>();
  for (const m of state.matches) {
    const key = m.round || "Mecze";
    byRound.set(key, [...(byRound.get(key) ?? []), m]);
  }
  return (
    <div className="space-y-5">
      {Array.from(byRound.entries()).map(([round, list]) => (
        <div key={round}>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">{round}</p>
          <div className="space-y-2">
            {list.map((m) => (
              <div key={m.id} className="rounded-xl border border-border bg-card p-3">
                <MatchRow match={m} showTournament={false} />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {m.status === "upcoming" ? `Start ${m.time || "wkrótce"}` : m.status === "live" ? m.statusLabel : m.statusLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  tournaments: Tournament[];
}

export function CalendarClient({ tournaments }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const TODAY = todayIso();
  const todayDate = parseIsoDate(TODAY);

  const [view, setView] = useState<View>("calendar");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [tourFilter, setTourFilter] = useState<TourFilter>("all");
  const [calYear, setCalYear] = useState(todayDate.getFullYear());
  const [calMonth, setCalMonth] = useState(todayDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(TODAY);

  const selectedId = searchParams.get("t");
  const selectedTournament = useMemo(() => tournaments.find((t) => t.id === selectedId) ?? null, [tournaments, selectedId]);

  function openTournament(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("t", id);
    else params.delete("t");
    router.replace(params.size ? `/kalendarz?${params}` : "/kalendarz", { scroll: false });
  }

  const dayMatches = useDayMatches(selectedDay);
  const tournamentMatches = useTournamentMatches(selectedTournament?.id ?? null);

  // ── Month grid ────────────────────────────────────────────────────────────
  const firstDay = new Date(calYear, calMonth, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthKey = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
  const monthTournaments = tournaments.filter((t) => t.startDate.slice(0, 7) <= monthKey && t.endDate.slice(0, 7) >= monthKey && matchesTour(t, tourFilter));

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); } else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); } else setCalMonth((m) => m + 1);
  }
  function goToday() {
    setCalYear(todayDate.getFullYear());
    setCalMonth(todayDate.getMonth());
    setSelectedDay(TODAY);
  }

  // ── List view ─────────────────────────────────────────────────────────────
  const listItems = tournaments
    .filter((t) => (status === "all" || t.status === status) && matchesTour(t, tourFilter))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const grouped = listItems.reduce<Record<string, Tournament[]>>((acc, t) => {
    const key = formatDate(t.startDate, { month: "long", year: "numeric" });
    (acc[key] ??= []).push(t);
    return acc;
  }, {});

  const dayTournaments = tournaments.filter((t) => onDay(t, selectedDay) && matchesTour(t, tourFilter));
  const selectedDateLabel = formatDate(selectedDay, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={tourFilter === "all"} onClick={() => setTourFilter("all")}>Wszystkie</Chip>
          <Chip active={tourFilter === "ATP"} onClick={() => setTourFilter("ATP")}>ATP</Chip>
          <Chip active={tourFilter === "WTA"} onClick={() => setTourFilter("WTA")}>WTA</Chip>
          <Chip active={tourFilter === "Grand Slam"} onClick={() => setTourFilter("Grand Slam")} tone="brand">Wielki Szlem</Chip>
          {view === "list" && (
            <>
              <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
              <Chip active={status === "all"} onClick={() => setStatus("all")}>Cały sezon</Chip>
              <Chip active={status === "live"} onClick={() => setStatus("live")}><span className="live-dot" aria-hidden="true" /> Trwające</Chip>
              <Chip active={status === "upcoming"} onClick={() => setStatus("upcoming")}>Nadchodzące</Chip>
              <Chip active={status === "completed"} onClick={() => setStatus("completed")}>Zakończone</Chip>
            </>
          )}
        </div>
        <div className="inline-flex self-start rounded-lg border border-border bg-card p-1" role="tablist" aria-label="Widok">
          <button role="tab" aria-selected={view === "calendar"} onClick={() => setView("calendar")} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors", view === "calendar" ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-ink")}>
            <LayoutGrid className="h-3.5 w-3.5" /> Kalendarz
          </button>
          <button role="tab" aria-selected={view === "list"} onClick={() => setView("list")} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors", view === "list" ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-ink")}>
            <List className="h-3.5 w-3.5" /> Lista
          </button>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <EmptyState title="Kalendarz jest w przygotowaniu" description="Turnieje pojawią się po dodaniu ich w panelu redakcji." icon={<CalendarDays className="h-5 w-5" />} />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {view === "calendar" ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <button onClick={prevMonth} className="rounded-lg border border-border bg-card p-2 transition-colors hover:bg-muted" aria-label="Poprzedni miesiąc"><ChevronLeft className="h-4 w-4" /></button>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-ink">{MONTHS_PL[calMonth]} {calYear}</h2>
                    {(calYear !== todayDate.getFullYear() || calMonth !== todayDate.getMonth()) && (
                      <button onClick={goToday} className="rounded-md border border-border bg-card px-2 py-1 text-[11px] font-bold text-muted-foreground hover:text-ink">Dziś</button>
                    )}
                  </div>
                  <button onClick={nextMonth} className="rounded-lg border border-border bg-card p-2 transition-colors hover:bg-muted" aria-label="Następny miesiąc"><ChevronRight className="h-4 w-4" /></button>
                </div>

                <div className="mb-1 grid grid-cols-7">
                  {DAYS_PL.map((d) => <div key={d} className="py-2 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-border bg-border">
                  {cells.map((day, idx) => {
                    if (day === null) return <div key={`e-${idx}`} className="min-h-[72px] bg-muted/40 sm:min-h-[96px]" />;
                    const date = isoDate(calYear, calMonth, day);
                    const dayTours = monthTournaments.filter((t) => onDay(t, date));
                    const isToday = date === TODAY;
                    const isSelected = date === selectedDay;
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDay(date)}
                        aria-pressed={isSelected}
                        aria-label={`${formatDate(date)}${dayTours.length ? `, ${dayTours.length} turn.` : ""}`}
                        className={cn(
                          "flex min-h-[72px] flex-col items-start gap-1 p-1.5 text-left transition-colors sm:min-h-[96px] sm:p-2",
                          isSelected ? "bg-ink text-ink-foreground" : "bg-card hover:bg-muted/60",
                        )}
                      >
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", isToday && !isSelected && "bg-brand text-brand-foreground", isSelected && "bg-brand text-brand-foreground")}>{day}</span>
                        <span className="flex w-full flex-col gap-0.5">
                          {dayTours.slice(0, 3).map((t) => (
                            <span
                              key={t.id}
                              className="hidden w-full truncate rounded px-1 py-0.5 text-[10px] font-semibold leading-tight sm:block"
                              style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.15)" : `${surfaceDotColors[t.surface]}1f`, color: isSelected ? "#fff" : surfaceDotColors[t.surface] }}
                              title={t.name}
                            >
                              {t.startDate === date ? "▶ " : ""}{t.name}
                            </span>
                          ))}
                          <span className="flex gap-0.5 sm:hidden">
                            {dayTours.slice(0, 4).map((t) => <span key={t.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isSelected ? "#fff" : surfaceDotColors[t.surface] }} />)}
                          </span>
                          {dayTours.length > 3 && <span className={cn("hidden text-[10px] sm:block", isSelected ? "text-white/70" : "text-muted-foreground")}>+{dayTours.length - 3}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-4">
                  {(Object.keys(surfaceDotColors) as Array<keyof typeof surfaceDotColors>).map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: surfaceDotColors[s] }} />{surfaceLabels[s]}
                    </span>
                  ))}
                </div>

                {monthTournaments.length > 0 && (
                  <div className="mt-8 border-t border-border pt-6">
                    <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Turnieje: {MONTHS_PL[calMonth].toLowerCase()} {calYear}</h3>
                    <div className="space-y-2">
                      {monthTournaments.map((t) => <TournamentListItem key={t.id} t={t} onClick={() => openTournament(t.id)} />)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.keys(grouped).length === 0 && <EmptyState title="Brak turniejów dla wybranych filtrów" />}
                {Object.entries(grouped).map(([month, list]) => (
                  <section key={month}>
                    <div className="mb-3 flex items-center gap-3">
                      <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-ink">{month}</h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-2">
                      {list.map((t) => <TournamentListItem key={t.id} t={t} onClick={() => openTournament(t.id)} />)}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          {/* Day panel */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border bg-ink px-4 py-3 text-ink-foreground">
                <h2 className="flex items-center gap-2 text-sm font-black">
                  {selectedDay === TODAY ? <><span className="live-dot" aria-hidden="true" /> Dzisiaj na kortach</> : <><CalendarDays className="h-4 w-4 opacity-70" /> Wybrany dzień</>}
                </h2>
                <p className="mt-0.5 text-xs capitalize text-white/60">{selectedDateLabel}</p>
              </div>
              <div key={selectedDay} className="anim-switch">
                {dayTournaments.length > 0 ? (
                  <div className="divide-y divide-border">
                    {dayTournaments.map((t) => (
                      <button key={t.id} onClick={() => openTournament(t.id)} className="w-full p-4 text-left transition-colors hover:bg-muted/50">
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          <CategoryBadge category={t.category} />
                          <SurfaceBadge surface={t.surface} />
                          {t.status === "live" && <LiveBadge />}
                        </div>
                        <p className="flex items-center gap-2 text-sm font-bold text-ink"><Flag flag={t.flag} country={t.country} />{t.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{t.location}{t.country ? `, ${t.country}` : ""} · {formatDateShort(t.startDate)} – {formatDateShort(t.endDate)}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <CalendarDays className="mx-auto mb-2 h-7 w-7 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-ink">Brak turniejów ATP/WTA</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">W tym dniu nie trwa żaden turniej z kalendarza.</p>
                  </div>
                )}
                <div className="border-t border-border bg-muted/40 px-4 py-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">Mecze tego dnia</p>
                </div>
                <div className="max-h-[28rem] overflow-y-auto p-3">
                  <MatchList state={{ ...dayMatches, matches: dayMatches.matches.slice(0, 30) }} emptyText="Brak meczów ATP/WTA w tym dniu." />
                  {dayMatches.matches.length > 0 && selectedDay === TODAY && (
                    <Link href="/wyniki-live" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-strong hover:opacity-70">
                      Wszystkie wyniki live <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Tournament sheet */}
      <Sheet open={Boolean(selectedTournament)} onOpenChange={(open) => !open && openTournament(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selectedTournament && (
            <>
              <div className="relative h-48 w-full shrink-0 overflow-hidden">
                {selectedTournament.imageUrl ? (
                  <Image src={selectedTournament.imageUrl} alt={selectedTournament.name} fill sizes="640px" className="object-cover" />
                ) : (
                  <ImagePlaceholder surface={selectedTournament.surface} label={selectedTournament.location} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute left-4 top-4 flex gap-1.5">
                  <CategoryBadge category={selectedTournament.category} />
                  {selectedTournament.status === "live" && <LiveBadge />}
                </div>
                <div className="absolute bottom-4 left-5 right-5">
                  <SheetTitle className="flex items-center gap-2 text-left text-2xl font-black text-white">
                    <Flag flag={selectedTournament.flag} country={selectedTournament.country} />
                    {selectedTournament.name}
                  </SheetTitle>
                  <p className="mt-0.5 text-xs text-white/75">{selectedTournament.location}{selectedTournament.country ? `, ${selectedTournament.country}` : ""}</p>
                  {selectedTournament.imageCredit && <p className="mt-1 text-[10px] text-white/50">{selectedTournament.imageCredit}</p>}
                </div>
              </div>

              <div className="space-y-6 px-5 pb-8 pt-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="mb-1 text-[11px] text-muted-foreground">Nawierzchnia</p>
                    <SurfaceBadge surface={selectedTournament.surface} />
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="mb-1 text-[11px] text-muted-foreground">Kategoria</p>
                    <CategoryBadge category={selectedTournament.category} />
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="mb-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground"><CalendarDays className="h-3 w-3" /> Termin</p>
                    <p className="text-sm font-semibold text-ink">{formatDateRange(selectedTournament.startDate, selectedTournament.endDate)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="mb-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Trophy className="h-3 w-3" /> Pula nagród</p>
                    <p className="text-sm font-semibold text-ink">{selectedTournament.prize || "—"}</p>
                  </div>
                </div>

                {selectedTournament.description && <p className="text-sm leading-relaxed text-foreground/85">{selectedTournament.description}</p>}

                {selectedTournament.currentChampion && (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground"><Trophy className="h-4 w-4" /></div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">Obrońca tytułu</p>
                      <p className="text-sm font-bold text-ink">{selectedTournament.currentChampion}</p>
                    </div>
                  </div>
                )}

                {selectedTournament.pastWinners && selectedTournament.pastWinners.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">Poprzedni zwycięzcy</p>
                    <ul className="divide-y divide-border rounded-xl border border-border">
                      {selectedTournament.pastWinners.map((w) => (
                        <li key={`${w.year}-${w.name}`} className="flex items-center gap-3 px-3 py-2 text-sm">
                          <span className="tabular w-12 text-xs font-bold text-muted-foreground">{w.year}</span>
                          <span className="font-medium text-ink">{w.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                    Mecze {selectedTournament.status === "live" && <span className="live-dot" aria-hidden="true" />}
                  </p>
                  {selectedTournament.status === "upcoming" && !tournamentMatches.loading && tournamentMatches.matches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Drabinka i mecze pojawią się po losowaniu, zwykle kilka dni przed startem.</p>
                  ) : (
                    <MatchList state={tournamentMatches} emptyText="Brak danych o meczach tego turnieju." />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedTournament.liveStreamUrl && (
                    <a href={selectedTournament.liveStreamUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground hover:bg-ink-muted">
                      <PlayCircle className="h-4 w-4" /> Oglądaj transmisję <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {selectedTournament.website && (
                    <a href={selectedTournament.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
                      Strona turnieju <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
