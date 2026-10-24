"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LiveMatch } from "@/lib/types";

interface Props {
  initial?: LiveMatch[];
  /** polling interval in ms */
  interval?: number;
}

export function LiveTicker({ initial = [], interval = 60_000 }: Props) {
  const [matches, setMatches] = useState<LiveMatch[]>(initial);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/livescores?scope=tour", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { matches?: LiveMatch[] };
        if (active && Array.isArray(data.matches)) setMatches(data.matches);
      } catch {
        /* keep the last good state */
      }
    };
    load();
    const id = setInterval(load, interval);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [interval]);

  const live = matches.filter((m) => m.status === "live");
  if (live.length === 0) return null;

  const items = [...live, ...live];
  const duration = `${Math.max(45, live.length * 10)}s`;

  return (
    <div className="border-b border-white/10 bg-ink text-ink-foreground" aria-label="Wyniki na żywo">
      <div className="flex h-11 items-stretch">
        <Link href="/wyniki-live" className="flex shrink-0 items-center gap-2 border-r border-white/10 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-brand">
          <span className="live-dot" aria-hidden="true" />
          Live
        </Link>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex h-full items-center" style={{ "--ticker-duration": duration } as React.CSSProperties}>
            {items.map((m, i) => (
              <Link
                key={`${m.id}-${i}`}
                href="/wyniki-live"
                className="flex h-full shrink-0 items-center gap-3 border-r border-white/10 px-5 transition-colors hover:bg-white/5"
              >
                <span className="whitespace-nowrap text-[11px] font-medium text-white/45">{m.tournament}</span>
                <span className="whitespace-nowrap text-sm font-semibold">{m.player1.name}</span>
                <span className="flex items-center gap-1 tabular text-xs font-black text-brand">
                  {m.sets.map((s, si) => (
                    <span key={si}>
                      {s.p1}–{s.p2}
                    </span>
                  ))}
                  {m.currentGame && <span className="text-white/60">({m.currentGame})</span>}
                </span>
                <span className="whitespace-nowrap text-sm font-semibold">{m.player2.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
