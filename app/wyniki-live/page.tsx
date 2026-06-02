"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  Clock,
  Circle,
} from "lucide-react";
import { liveMatches, surfaceColors, type LiveMatch } from "@/lib/mock-data";

function MatchStatusBadge({ status }: { status: LiveMatch["status"] }) {
  if (status === "live")
    return (
      <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--live)" }}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--live)" }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "var(--live)" }} />
        </span>
        LIVE
      </span>
    );
  if (status === "finished")
    return <span className="text-xs text-muted-foreground font-medium">Zakończony</span>;
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
      <Clock className="h-3 w-3" /> Nadchodzący
    </span>
  );
}

function StatBar({ label, v1, v2 }: { label: string; v1: number; v2: number }) {
  const total = v1 + v2 || 1;
  const pct1 = Math.round((v1 / total) * 100);
  const pct2 = 100 - pct1;
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span>{v1}{label.includes("%") ? "%" : ""}</span>
        <span className="text-muted-foreground text-center flex-1 text-[11px]">{label}</span>
        <span>{v2}{label.includes("%") ? "%" : ""}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
        <div
          className="rounded-l-full anim-grow-x"
          style={{
            width: `${pct1}%`,
            backgroundColor: "var(--brand)",
            transformOrigin: "left",
          }}
        />
        <div
          className="rounded-r-full anim-grow-x"
          style={{
            width: `${pct2}%`,
            backgroundColor: "var(--gold)",
            transformOrigin: "right",
            animationDelay: "320ms",
          }}
        />
      </div>
    </div>
  );
}

export default function WynikiLivePage() {
  const [selected, setSelected] = useState<string>(liveMatches[0].id);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const match = liveMatches.find((m) => m.id === selected) ?? liveMatches[0];

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 800);
  }

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 60000);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ color: "var(--brand)" }}>
            Wyniki live
          </h1>
          <p className="text-muted-foreground text-sm">Aktualne wyniki meczów tenisowych</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">
            {timeAgo === 0 ? "Właśnie odświeżono" : `${timeAgo} min temu`}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Sidebar: match list ── */}
        <div className="lg:col-span-1 space-y-2">
          {liveMatches.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selected === m.id
                  ? "border-transparent"
                  : "border-border hover:border-border/80 hover:bg-muted/30"
              }`}
              style={selected === m.id ? { backgroundColor: "var(--brand)", color: "white" } : {}}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${selected === m.id ? "text-white/70" : "text-muted-foreground"}`}>
                  {m.tournament} · {m.round}
                </span>
                <MatchStatusBadge status={m.status} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`flex items-center gap-1.5 text-sm font-semibold ${selected === m.id ? "text-white" : ""}`}>
                    {m.server === 1 && m.status === "live" && (
                      <Circle className="h-2 w-2 fill-current" style={{ color: selected === m.id ? "var(--gold)" : "var(--gold)" }} />
                    )}
                    {m.flag1} {m.player1}
                  </span>
                  <div className="flex gap-1">
                    {m.sets.map((s, i) => (
                      <span
                        key={i}
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          selected === m.id
                            ? "bg-white/20 text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {s.p1}
                      </span>
                    ))}
                    {m.status === "live" && (
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          selected === m.id ? "bg-white/10 text-white/80" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.currentGame.split("-")[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`flex items-center gap-1.5 text-sm font-semibold ${selected === m.id ? "text-white" : ""}`}>
                    {m.server === 2 && m.status === "live" && (
                      <Circle className="h-2 w-2 fill-current" style={{ color: "var(--gold)" }} />
                    )}
                    {m.flag2} {m.player2}
                  </span>
                  <div className="flex gap-1">
                    {m.sets.map((s, i) => (
                      <span
                        key={i}
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          selected === m.id
                            ? "bg-white/20 text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {s.p2}
                      </span>
                    ))}
                    {m.status === "live" && (
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          selected === m.id ? "bg-white/10 text-white/80" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.currentGame.split("-")[1]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {m.status === "upcoming" && (
                <p className={`text-xs mt-2 ${selected === m.id ? "text-white/60" : "text-muted-foreground"}`}>
                  Rozpoczęcie: {m.startTime}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* ── Detail Panel ── */}
        <div key={selected} className="lg:col-span-2 anim-switch">
          <div className="rounded-xl border border-border overflow-hidden">
            {/* Match header */}
            <div className="p-5" style={{ backgroundColor: "var(--brand)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border ${surfaceColors[match.surface]}`}
                  >
                    {match.surface}
                  </span>
                  <span className="text-white/60 text-xs">{match.tournament} · {match.round}</span>
                </div>
                <MatchStatusBadge status={match.status} />
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Player 1 */}
                <div className="text-center">
                  <div className="text-3xl mb-1">{match.flag1}</div>
                  <p className="text-white font-bold text-lg">{match.player1}</p>
                  {match.server === 1 && match.status === "live" && (
                    <span className="text-xs" style={{ color: "var(--gold)" }}>● Serwuje</span>
                  )}
                </div>

                {/* Score */}
                <div className="text-center">
                  <div className="flex justify-center gap-2 mb-2">
                    {match.sets.length > 0 ? (
                      match.sets.map((set, i) => (
                        <div key={i} className="text-center">
                          <div className="text-2xl font-black text-white">{set.p1}</div>
                          <div className="text-2xl font-black text-white/50">–</div>
                          <div className="text-2xl font-black text-white">{set.p2}</div>
                        </div>
                      ))
                    ) : (
                      <span className="text-white/50 text-sm">Mecz nie rozpoczęty</span>
                    )}
                  </div>
                  {match.status === "live" && match.currentGame && (
                    <div
                      className="text-sm font-bold px-3 py-1 rounded-full inline-block"
                      style={{ backgroundColor: "var(--gold)", color: "var(--brand)" }}
                    >
                      {match.currentGame}
                    </div>
                  )}
                  {match.status === "upcoming" && (
                    <div className="text-white/60 text-sm mt-1">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {match.startTime}
                    </div>
                  )}
                </div>

                {/* Player 2 */}
                <div className="text-center">
                  <div className="text-3xl mb-1">{match.flag2}</div>
                  <p className="text-white font-bold text-lg">{match.player2}</p>
                  {match.server === 2 && match.status === "live" && (
                    <span className="text-xs" style={{ color: "var(--gold)" }}>● Serwuje</span>
                  )}
                </div>
              </div>
            </div>

            {/* Set-by-set breakdown */}
            {match.sets.length > 0 && (
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Sety
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground">
                        <th className="text-left pb-2 font-medium">Zawodnik</th>
                        {match.sets.map((_, i) => (
                          <th key={i} className="text-center pb-2 font-medium w-12">
                            Set {i + 1}
                          </th>
                        ))}
                        {match.status === "live" && <th className="text-center pb-2 font-medium w-12">Gra</th>}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="py-2 font-medium">{match.flag1} {match.player1}</td>
                        {match.sets.map((s, i) => (
                          <td key={i} className="text-center font-bold py-2">{s.p1}</td>
                        ))}
                        {match.status === "live" && (
                          <td className="text-center py-2 font-bold" style={{ color: "var(--gold)" }}>
                            {match.currentGame.split("-")[0]}
                          </td>
                        )}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="py-2 font-medium">{match.flag2} {match.player2}</td>
                        {match.sets.map((s, i) => (
                          <td key={i} className="text-center font-bold py-2">{s.p2}</td>
                        ))}
                        {match.status === "live" && (
                          <td className="text-center py-2 font-bold" style={{ color: "var(--gold)" }}>
                            {match.currentGame.split("-")[1]}
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Stats */}
            {match.status !== "upcoming" && (
              <div className="p-5">
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                  Statystyki meczu
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span style={{ color: "var(--brand)" }}>{match.player1}</span>
                    <span style={{ color: "var(--gold)" }}>{match.player2}</span>
                  </div>
                  <StatBar label="Asy" v1={match.stats.aces[0]} v2={match.stats.aces[1]} />
                  <StatBar label="Podwójne błędy" v1={match.stats.doubleFaults[0]} v2={match.stats.doubleFaults[1]} />
                  <StatBar label="% pierwszego serwisu" v1={match.stats.firstServe[0]} v2={match.stats.firstServe[1]} />
                  <StatBar label="Winnersy" v1={match.stats.winners[0]} v2={match.stats.winners[1]} />
                  <StatBar label="Błędy niewymuszne" v1={match.stats.errors[0]} v2={match.stats.errors[1]} />
                  <StatBar label="Szanse breakowe" v1={match.stats.breakPoints[0]} v2={match.stats.breakPoints[1]} />
                </div>
              </div>
            )}

            {match.status === "upcoming" && (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Mecz rozpocznie się o {match.startTime}</p>
                <p className="text-sm mt-1">Statystyki będą dostępne po rozpoczęciu meczu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
