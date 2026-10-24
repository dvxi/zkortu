import type { LiveMatch, MatchSet } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Flag } from "./Flag";
import { MatchStatusBadge } from "./Badges";

function setWinner(set: MatchSet): 1 | 2 | null {
  if (set.p1 === set.p2) return null;
  return set.p1 > set.p2 ? 1 : 2;
}

interface PlayerLineProps {
  match: LiveMatch;
  side: 1 | 2;
  inverted?: boolean;
}

function PlayerLine({ match, side, inverted }: PlayerLineProps) {
  const player = side === 1 ? match.player1 : match.player2;
  const isWinner = match.winner === side;
  const isServing = match.status === "live" && match.server === side;
  const game = match.currentGame ? match.currentGame.split(/\s*-\s*/)[side - 1] : null;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn("flex min-w-0 items-center gap-2 text-sm", isWinner ? "font-black" : "font-semibold", match.status === "finished" && !isWinner && match.winner && "opacity-60")}>
        <Flag flag={player.flag} country={player.countryCode} className="w-5 shrink-0 text-center text-base" />
        <span className="truncate">{player.name}</span>
        {isServing && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", inverted ? "bg-brand" : "bg-brand-strong")} aria-label="Serwuje" />}
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {match.sets.map((s, i) => {
          const w = setWinner(s);
          const v = side === 1 ? s.p1 : s.p2;
          return (
            <span
              key={i}
              className={cn(
                "tabular inline-flex h-6 w-6 items-center justify-center rounded text-xs",
                inverted ? "bg-white/15 text-white" : "bg-muted text-ink",
                w === side ? "font-black" : "font-medium opacity-80",
              )}
            >
              {v}
            </span>
          );
        })}
        {match.status === "live" && game !== null && (
          <span className={cn("tabular inline-flex h-6 min-w-6 items-center justify-center rounded px-1 text-xs font-black", inverted ? "bg-brand text-brand-foreground" : "bg-brand-soft text-brand-strong")}>
            {game}
          </span>
        )}
      </span>
    </div>
  );
}

interface Props {
  match: LiveMatch;
  selected?: boolean;
  showTournament?: boolean;
  className?: string;
}

/** Two-line scoreboard row. Wrap in a button or div; uses `selected` for inverted styling. */
export function MatchRow({ match, selected, showTournament = true, className }: Props) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {showTournament && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={cn("truncate text-[11px] font-semibold", selected ? "text-white/70" : "text-muted-foreground")}>
            {match.tournament}
            {match.round ? ` · ${match.round}` : ""}
            {match.isDoubles ? " · debel" : ""}
          </span>
          <MatchStatusBadge status={match.status} label={match.statusLabel} time={match.time} className={selected ? "text-white/80" : undefined} />
        </div>
      )}
      <PlayerLine match={match} side={1} inverted={selected} />
      <PlayerLine match={match} side={2} inverted={selected} />
    </div>
  );
}
