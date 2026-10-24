import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { Tournament } from "@/lib/types";
import { formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CategoryBadge, LiveBadge, SurfaceBadge } from "./Badges";
import { Flag } from "./Flag";
import { ImagePlaceholder } from "./ImagePlaceholder";
import Image from "next/image";

interface Props {
  tournament: Tournament;
  className?: string;
  /** link target; defaults to the calendar with the tournament sheet open */
  href?: string;
}

export function TournamentCard({ tournament: t, className, href }: Props) {
  const target = href ?? `/kalendarz?t=${encodeURIComponent(t.id)}`;
  return (
    <Link
      href={target}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(28,25,23,0.25)]",
        className,
      )}
    >
      <div className="relative aspect-[2/1] overflow-hidden">
        {t.imageUrl ? (
          <Image src={t.imageUrl} alt={t.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <ImagePlaceholder surface={t.surface} label={t.location} />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <CategoryBadge category={t.category} className="shadow-sm" />
          {t.status === "live" && <LiveBadge />}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-bold leading-snug text-ink">
            <Flag flag={t.flag} country={t.country} className="text-lg" />
            <span className="line-clamp-2">{t.name}</span>
          </h3>
          <SurfaceBadge surface={t.surface} className="shrink-0" />
        </div>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {[t.location, t.country].filter(Boolean).join(", ")}
          </p>
          <p className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDateRange(t.startDate, t.endDate)}
          </p>
        </div>
      </div>
    </Link>
  );
}
