import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PolishMatchesDay } from "@/lib/polish-matches";
import type { PlayerProfileLink } from "@/lib/sanity";
import { formatDateShort, pluralPl } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MatchRow } from "./MatchRow";

interface Props {
  day: PolishMatchesDay;
  limit?: number;
  className?: string;
  /** API player key → profile; player names link to profiles */
  profiles?: Record<string, PlayerProfileLink>;
}

/** Homepage box: today's (or tomorrow's) matches with a Polish player, every level. */
export function PolishMatchesWidget({ day, limit = 8, className, profiles }: Props) {
  const rows = day.matches.slice(0, limit);
  const more = day.matches.length - rows.length;
  const anyLive = day.matches.some((m) => m.status === "live");
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)} aria-labelledby="polish-matches">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 id="polish-matches" className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-ink">
          <span className="text-base leading-none" aria-hidden="true">🇵🇱</span>
          Mecze Polek i Polaków
          {anyLive && <span className="live-dot" aria-hidden="true" />}
        </h2>
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">{day.isTomorrow ? `Jutro, ${formatDateShort(day.date)}` : "Dziś"}</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((m) => (
          <li key={m.id} className="px-4 py-3">
            <MatchRow match={m} profiles={profiles} />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
        <span className="text-xs text-muted-foreground">{more > 0 ? `+${more} ${pluralPl(more, "kolejny mecz", "kolejne mecze", "kolejnych meczów")}` : ""}</span>
        <Link href="/wyniki-live" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-strong hover:opacity-70">
          Wyniki live <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}
