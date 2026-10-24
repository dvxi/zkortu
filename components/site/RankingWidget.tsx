import Link from "next/link";
import { ArrowRight, Minus, Trophy, TrendingDown, TrendingUp } from "lucide-react";
import type { Player, RankMovement } from "@/lib/types";
import { formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Flag } from "./Flag";
import { ErrorState, EmptyState } from "./States";

export function MovementIcon({ movement, className }: { movement: RankMovement; className?: string }) {
  if (movement === "up") return <TrendingUp className={cn("h-3.5 w-3.5 text-emerald-600", className)} aria-label="Awans" />;
  if (movement === "down") return <TrendingDown className={cn("h-3.5 w-3.5 text-red-500", className)} aria-label="Spadek" />;
  return <Minus className={cn("h-3.5 w-3.5 text-muted-foreground/60", className)} aria-label="Bez zmian" />;
}

export function RankNumber({ rank, className }: { rank: number; className?: string }) {
  const tone = rank === 1 ? "text-brand-strong" : rank === 2 ? "text-slate-500" : rank === 3 ? "text-amber-700" : "text-muted-foreground";
  return <span className={cn("tabular font-black", tone, className)}>{rank}</span>;
}

interface Props {
  tour: "ATP" | "WTA";
  players: Player[];
  error?: string | null;
  limit?: number;
  className?: string;
}

export function RankingWidget({ tour, players, error, limit = 10, className }: Props) {
  const rows = players.slice(0, limit);
  const href = `/ranking?tour=${tour.toLowerCase()}`;
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)} aria-labelledby={`ranking-${tour}`}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 id={`ranking-${tour}`} className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-ink">
          <Trophy className="h-4 w-4 text-brand" />
          Ranking {tour}
        </h2>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-strong hover:opacity-70">
          Pełny ranking <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {error ? (
        <ErrorState compact title="Ranking chwilowo niedostępny" description={error} className="rounded-none border-0" />
      ) : rows.length === 0 ? (
        <EmptyState compact title="Brak danych rankingowych" className="rounded-none border-0" />
      ) : (
        <ol className="divide-y divide-border">
          {rows.map((p) => (
            <li key={`${p.rank}-${p.playerKey}`} className={cn("flex items-center gap-3 px-4 py-2 text-sm", p.rank <= 3 && "bg-brand-soft/60")}>
              <RankNumber rank={p.rank} className="w-5 text-right text-xs" />
              <Flag flag={p.flag} country={p.country} className="w-5 text-center text-base" />
              <span className="min-w-0 flex-1 truncate font-semibold text-ink">{p.name}</span>
              <span className="tabular text-xs text-muted-foreground">{formatPoints(p.points)}</span>
              <MovementIcon movement={p.movement} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
