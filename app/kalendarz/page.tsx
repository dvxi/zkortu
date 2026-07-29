"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CalendarDays,
  MapPin,
  Trophy,
  ExternalLink,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
} from "lucide-react";
import {
  surfaceColors,
  categoryColors,
  type Tournament,
  type LiveMatch,
} from "@/lib/mock-data";

const picsumSeedMap: Record<string, string> = {
  t1: "tennis-tour-t1",
  t2: "tennis-tour-t2",
  t3: "tennis-tour-t3",
  t4: "tennis-tour-t4",
  t5: "tennis-tour-t5",
  t6: "tennis-tour-t6",
  t7: "tennis-tour-t7",
  t8: "tennis-tour-t8",
  t9: "tennis-tour-t9",
  t10: "tennis-tour-t10",
  t11: "tennis-tour-t11",
  t12: "tennis-tour-t12",
};

const surfaceDotColors: Record<string, string> = {
  Clay: "#C8652E",
  Grass: "#3D8B3D",
  Hard: "#3B6CB0",
  "Indoor Hard": "#6B3DAF",
};

const mockDrawResults: Record<string, string[]> = {
  t1: ["J. Sinner (1) vs C. Ruud (5) — SF", "C. Alcaraz (2) vs H. Hurkacz (13) — QF", "I. Świątek (2) vs A. Sabalenka (1) — F"],
  t2: ["J. Draper vs T. Fritz — SF", "H. Rune vs T. Paul — QF"],
  t3: ["E. Rybakina vs C. Gauff — F", "J. Paolini vs D. Kasatkina — SF"],
};

const DAYS_PL = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const MONTHS_PL = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTournamentsForDay(dateStr: string, all: Tournament[]): Tournament[] {
  return all.filter(
    (t) => dateStr >= t.startDate && dateStr <= t.endDate
  );
}

function StatusIcon({ status }: { status: Tournament["status"] }) {
  if (status === "live")
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--live)" }} />
        <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: "var(--live)" }} />
      </span>
    );
  if (status === "completed")
    return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
  return <Circle className="h-3.5 w-3.5 text-muted-foreground" />;
}

function TournamentListItem({
  t,
  onClick,
}: {
  t: Tournament;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full text-left group">
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-border/80 hover:bg-muted/20 transition-all bg-card">
        <div className="flex-shrink-0">
          <StatusIcon status={t.status} />
        </div>
        <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block">
          <Image
            src={`https://picsum.photos/seed/${picsumSeedMap[t.id] ?? "tennis-tour-t1"}/160/128`}
            alt={t.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${categoryColors[t.category]}`}>
              {t.category}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${surfaceColors[t.surface]}`}>
              {t.surface}
            </span>
            {t.status === "live" && (
              <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: "var(--live)" }}>
                LIVE
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm truncate">{t.flag} {t.name}</h3>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {t.location}, {t.country}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {new Date(t.startDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
              {" – "}
              {new Date(t.endDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3" />
              {t.prize}
            </span>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}

async function loadCalendar(): Promise<Tournament[]> {
  try {
    const res = await fetch("/api/calendar");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function loadLiveScores(): Promise<LiveMatch[]> {
  try {
    const res = await fetch("/api/livescores");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default function KalendarzPage() {
  const TODAY = new Date().toISOString().slice(0, 10);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "completed">("all");
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<string>(TODAY);

  const [todayMatches, setTodayMatches] = useState<LiveMatch[]>([]);

  useEffect(() => {
    loadCalendar().then(d => { if (d.length) setTournaments(d); });
    loadLiveScores().then(d => setTodayMatches(d));
  }, []);

  // ── Calendar grid data ──────────────────────────────────────────────────────
  const firstDayOfMonth = new Date(calYear, calMonth, 1);
  // Monday-first: convert Sunday(0)→6, Mon(1)→0, ...
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // Build flat array of cells (nulls for padding, numbers for days)
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  // ── List view data ──────────────────────────────────────────────────────────
  const filteredList = tournaments
    .filter((t) => filter === "all" || t.status === filter)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const grouped = filteredList.reduce<Record<string, Tournament[]>>((acc, t) => {
    const month = new Date(t.startDate).toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(t);
    return acc;
  }, {});

  // ── Right panel: selected day events ───────────────────────────────────────
  const dayTournaments = getTournamentsForDay(selectedDay, tournaments);
  const dayMatches = selectedDay === TODAY ? todayMatches : [];

  const selectedDate = new Date(selectedDay + "T12:00:00");
  const selectedDateLabel = selectedDate.toLocaleDateString("pl-PL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ color: "var(--brand)" }}>
            Kalendarz turniejów
          </h1>
          <p className="text-muted-foreground">Harmonogram turniejów ATP i WTA — sezon 2026</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/30">
          <button
            onClick={() => setView("calendar")}
            className={`p-2 rounded-md transition-colors ${view === "calendar" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
            style={view === "calendar" ? { backgroundColor: "var(--brand)" } : {}}
            title="Widok kalendarza"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-md transition-colors ${view === "list" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
            style={view === "list" ? { backgroundColor: "var(--brand)" } : {}}
            title="Widok listy"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Calendar or List ─────────────────────────────────────────── */}
        <div className="lg:col-span-2">

          {view === "calendar" ? (
            /* ── CALENDAR GRID VIEW ── */
            <div>
              {/* Month navigator */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h2 className="text-lg font-bold" style={{ color: "var(--brand)" }}>
                  {MONTHS_PL[calMonth]} {calYear}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS_PL.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wide">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="bg-muted/20 min-h-[90px]" />;
                  }
                  const dateStr = isoDate(calYear, calMonth, day);
                  const dayTours = getTournamentsForDay(dateStr, tournaments);
                  const startingTours = tournaments.filter((t) => t.startDate === dateStr);
                  const isToday = dateStr === TODAY;
                  const isSelected = dateStr === selectedDay;
                  const hasTournament = dayTours.length > 0;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDay(dateStr)}
                      className={`
                        cursor-pointer relative flex flex-col items-start p-2 min-h-[90px] text-sm font-medium transition-colors
                        ${isSelected
                          ? "text-white"
                          : hasTournament
                          ? "text-foreground hover:bg-muted/40"
                          : "text-muted-foreground hover:bg-muted/30"
                        }
                      `}
                      style={{
                        backgroundColor: isSelected ? "var(--brand)" : "var(--card)",
                      }}
                    >
                      {/* Day number */}
                      <span
                        className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1 flex-shrink-0"
                        style={
                          isToday && !isSelected
                            ? { backgroundColor: "var(--gold)", color: "white" }
                            : undefined
                        }
                      >
                        {day}
                      </span>

                      {/* Tournament event chips — show starting tournaments */}
                      <div className="w-full space-y-0.5">
                        {startingTours.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            className="w-full truncate text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: isSelected
                                ? "rgba(255,255,255,0.2)"
                                : `${surfaceDotColors[t.surface]}22`,
                              color: isSelected
                                ? "rgba(255,255,255,0.9)"
                                : surfaceDotColors[t.surface],
                            }}
                          >
                            {t.name}
                          </div>
                        ))}
                        {/* Ongoing (not starting) — compact dots row */}
                        {hasTournament && startingTours.length === 0 && (
                          <div className="flex gap-0.5 px-0.5 pt-0.5">
                            {dayTours.slice(0, 3).map((t, i) => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: isSelected
                                    ? "rgba(255,255,255,0.6)"
                                    : surfaceDotColors[t.surface],
                                }}
                              />
                            ))}
                          </div>
                        )}
                        {startingTours.length > 2 && (
                          <div className="text-[10px] px-1.5" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>
                            +{startingTours.length - 2} więcej
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Surface legend */}
              <div className="flex flex-wrap gap-4 mt-4">
                {Object.entries(surfaceDotColors).map(([surface, color]) => (
                  <div key={surface} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    {surface}
                  </div>
                ))}
              </div>

              {/* Month tournament summary */}
              {(() => {
                const monthTours = tournaments.filter((t) => {
                  const tStart = t.startDate.slice(0, 7);
                  const tEnd = t.endDate.slice(0, 7);
                  const cur = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
                  return tStart <= cur && tEnd >= cur;
                });
                if (monthTours.length === 0) return null;
                return (
                  <div className="mt-6 pt-5 border-t border-border">
                    <h3 className="text-sm font-bold mb-3" style={{ color: "var(--brand)" }}>
                      Turnieje w {MONTHS_PL[calMonth].toLowerCase()}
                    </h3>
                    <div className="space-y-2">
                      {monthTours.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTournament(t)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors bg-card text-left cursor-pointer"
                        >
                          <span
                            className="w-2 self-stretch rounded-full flex-shrink-0"
                            style={{ backgroundColor: surfaceDotColors[t.surface] }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{t.flag} {t.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(t.startDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                              {" – "}
                              {new Date(t.endDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                              {" · "}{t.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${surfaceColors[t.surface]}`}>
                              {t.surface}
                            </span>
                            {t.status === "live" && (
                              <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: "var(--live)" }}>LIVE</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* ── LIST VIEW ── */
            <div>
              {/* Filter pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(["all", "live", "upcoming", "completed"] as const).map((f) => {
                  const labels: Record<string, string> = {
                    all: "Wszystkie", live: "Trwające", upcoming: "Nadchodzące", completed: "Zakończone",
                  };
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                        filter === f ? "text-white border-transparent" : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                      style={filter === f ? { backgroundColor: "var(--brand)" } : {}}
                    >
                      {f === "live" && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ backgroundColor: filter === "live" ? "white" : "var(--live)" }} />
                          <span className="relative inline-flex rounded-full h-2 w-2"
                            style={{ backgroundColor: filter === "live" ? "white" : "var(--live)" }} />
                        </span>
                      )}
                      {labels[f]}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-8">
                {Object.entries(grouped).map(([month, monthTournaments]) => (
                  <section key={month}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--brand)" }}>
                        {month}
                      </h2>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="space-y-3">
                      {monthTournaments.map((t) => (
                        <TournamentListItem
                          key={t.id}
                          t={t}
                          onClick={() => setSelectedTournament(t)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Day panel ──────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="rounded-xl overflow-hidden border border-border sticky top-24">
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-border" style={{ backgroundColor: "var(--brand)" }}>
              <h2 className="font-bold text-white text-sm">
                {selectedDay === TODAY ? (
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--gold)" }} />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: "var(--gold)" }} />
                    </span>
                    Dzisiaj na kortach
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 opacity-70" />
                    Turnieje
                  </span>
                )}
              </h2>
              <p className="text-white/60 text-xs mt-0.5 capitalize">{selectedDateLabel}</p>
            </div>

            {/* Tournaments on selected day */}
            {dayTournaments.length > 0 ? (
              <div key={selectedDay} className="anim-switch divide-y divide-border bg-card">
                {dayTournaments.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTournament(t)}
                    className="w-full text-left p-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${surfaceColors[t.surface]}`}>
                        {t.surface}
                      </span>
                      {t.status === "live" && (
                        <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: "var(--live)" }}>
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm">{t.flag} {t.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.location}, {t.country}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(t.startDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                      {" – "}
                      {new Date(t.endDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div key={selectedDay} className="anim-switch p-8 text-center bg-card">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground font-medium">Brak turniejów</p>
                <p className="text-xs text-muted-foreground mt-1">W tym dniu nie rozgrywa się żaden turniej</p>
              </div>
            )}

            {/* Today's matches (only when today selected) */}
            {selectedDay === TODAY && dayMatches.length > 0 && (
              <>
                <div className="px-4 py-2 border-t border-border bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mecze dzisiaj</p>
                </div>
                <div className="divide-y divide-border bg-card">
                  {dayMatches.map((match) => {
                    const setsStr = match.sets.map(s => `${s.p1}-${s.p2}`).join(", ");
                    return (
                    <div key={match.id} className="p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground truncate">{match.tournament}</span>
                        {match.status === "live" ? (
                          <span className="text-xs font-bold text-white px-2 py-0.5 rounded flex-shrink-0 ml-2" style={{ backgroundColor: "var(--live)" }}>LIVE</span>
                        ) : match.status === "finished" ? (
                          <span className="text-xs text-green-600 font-medium flex-shrink-0 ml-2">Zakończony</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 ml-2">
                            <Clock className="h-3 w-3" />{match.startTime}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">{match.flag1} {match.player1}</span>
                          {setsStr && <span className="text-xs font-bold">{setsStr.split(",")[0]}</span>}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">{match.flag2} {match.player2}</span>
                          {setsStr && <span className="text-xs font-bold">{setsStr.split(",")[1]?.trim()}</span>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{match.round}</p>
                    </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Tournament Detail Sheet ── */}
      <Sheet open={!!selectedTournament} onOpenChange={() => setSelectedTournament(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedTournament && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl font-black" style={{ color: "var(--brand)" }}>
                  {selectedTournament.flag} {selectedTournament.name}
                </SheetTitle>
              </SheetHeader>

              <div className="px-4 pb-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Powierzchnia</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${surfaceColors[selectedTournament.surface]}`}>
                    {selectedTournament.surface}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Kategoria</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${categoryColors[selectedTournament.category]}`}>
                    {selectedTournament.category}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> Daty
                  </p>
                  <p className="text-sm font-semibold">
                    {selectedTournament.startDate
                      ? `${new Date(selectedTournament.startDate + "T12:00:00").toLocaleDateString("pl-PL", { day: "numeric", month: "short" })} – ${new Date(selectedTournament.endDate + "T12:00:00").toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}`
                      : "—"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Trophy className="h-3 w-3" /> Nagrody
                  </p>
                  <p className="text-sm font-semibold">{selectedTournament.prize}</p>
                </div>
              </div>

              {mockDrawResults[selectedTournament.id] && (
                <div>
                  <h3 className="font-bold text-sm mb-3">Aktualne wyniki drabinki</h3>
                  <div className="space-y-2">
                    {mockDrawResults[selectedTournament.id].map((result, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                        <PlayCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTournament.liveStreamUrl && (
                <a
                  href={selectedTournament.liveStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--brand)", color: "white" }}
                >
                  <PlayCircle className="h-4 w-4" />
                  Oglądaj na żywo
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              </div>{/* end px-4 wrapper */}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
