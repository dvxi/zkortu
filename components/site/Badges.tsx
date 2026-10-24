import { cn } from "@/lib/utils";
import {
  categoryColors,
  surfaceColors,
  surfaceLabels,
  tourLabels,
  type MatchStatus,
  type Surface,
  type Tour,
  type TournamentCategory,
} from "@/lib/types";

const base = "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold leading-4 whitespace-nowrap";

export function SurfaceBadge({ surface, className }: { surface: Surface; className?: string }) {
  return <span className={cn(base, surfaceColors[surface] ?? surfaceColors.Hard, className)}>{surfaceLabels[surface] ?? surface}</span>;
}

export function CategoryBadge({ category, className }: { category: TournamentCategory | string; className?: string }) {
  const cls = categoryColors[category as TournamentCategory] ?? categoryColors.Inne;
  return <span className={cn(base, cls, className)}>{category}</span>;
}

export function LiveBadge({ className, label = "Live" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md bg-live px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-white", className)}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      {label}
    </span>
  );
}

export function TourBadge({ tour, className }: { tour: Tour; className?: string }) {
  const tone =
    tour === "ATP" ? "bg-sky-50 text-sky-800 border-sky-200" : tour === "WTA" ? "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200" : "bg-slate-50 text-slate-700 border-slate-200";
  return <span className={cn(base, tone, className)}>{tourLabels[tour]}</span>;
}

export function MatchStatusBadge({ status, label, time, className }: { status: MatchStatus; label?: string; time?: string; className?: string }) {
  if (status === "live") return <LiveBadge className={className} label={label && label !== "Na żywo" ? label : "Live"} />;
  if (status === "finished") return <span className={cn("text-[11px] font-semibold text-muted-foreground", className)}>{label ?? "Zakończony"}</span>;
  if (status === "cancelled") return <span className={cn("text-[11px] font-semibold text-muted-foreground", className)}>Odwołany</span>;
  return <span className={cn("text-[11px] font-semibold tabular text-muted-foreground", className)}>{time ? `Start ${time}` : "Nadchodzący"}</span>;
}

export function Chip({
  active,
  children,
  className,
  tone = "ink",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; tone?: "ink" | "brand" }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors",
        active
          ? tone === "brand"
            ? "border-brand bg-brand text-brand-foreground"
            : "border-ink bg-ink text-ink-foreground"
          : "border-border bg-card text-muted-foreground hover:border-ink/30 hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
