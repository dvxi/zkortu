"use client";

import { useState } from "react";
import { Clock, ExternalLink, PlayCircle } from "lucide-react";
import type { SanityVideo } from "@/lib/sanity";
import { VIDEO_CATEGORIES, videoCategoryLabel } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Chip } from "@/components/site/Badges";
import { CoverImage } from "@/components/site/CoverImage";
import { EmptyState } from "@/components/site/States";
import { youtubeThumb } from "./youtube";

const categoryTone: Record<string, string> = {
  Highlights: "bg-sky-50 text-sky-800 border-sky-200",
  "Full Match": "bg-violet-50 text-violet-800 border-violet-200",
  Interview: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Analysis: "bg-orange-50 text-orange-800 border-orange-200",
};

function CategoryTag({ category }: { category?: string | null }) {
  if (!category) return null;
  return <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${categoryTone[category] ?? "bg-slate-50 text-slate-700 border-slate-200"}`}>{videoCategoryLabel(category)}</span>;
}

interface Props {
  videos: SanityVideo[];
  tournaments: string[];
}

export default function WideoClient({ videos, tournaments }: Props) {
  const [category, setCategory] = useState("all");
  const [tournament, setTournament] = useState("all");

  const filtered = videos.filter((v) => (category === "all" || v.category === category) && (tournament === "all" || v.tournament === tournament));
  const showFeatured = filtered.length >= 4;
  const featured = showFeatured ? filtered[0] : null;
  const grid = showFeatured ? filtered.slice(1) : filtered;

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Chip active={category === "all"} onClick={() => setCategory("all")}>Wszystkie</Chip>
          {VIDEO_CATEGORIES.map((c) => (
            <Chip key={c.value} active={category === c.value} onClick={() => setCategory(c.value)}>{c.label}</Chip>
          ))}
        </div>
        {tournaments.length > 0 && (
          <>
            <span className="hidden h-5 w-px bg-border sm:block" />
            <div className="flex flex-wrap gap-2">
              <Chip active={tournament === "all"} onClick={() => setTournament("all")} tone="brand">Wszystkie turnieje</Chip>
              {tournaments.map((t) => (
                <Chip key={t} active={tournament === t} onClick={() => setTournament(t)} tone="brand">{t}</Chip>
              ))}
            </div>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Brak filmów dla wybranych filtrów" />
      ) : (
        <div key={`${category}-${tournament}`} className="anim-switch space-y-8">
          {featured && (
            <a href={featured.youtubeUrl} target="_blank" rel="noopener noreferrer" className="group grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-5">
              <div className="relative aspect-video lg:col-span-3 lg:aspect-auto lg:min-h-[320px]">
                <CoverImage src={youtubeThumb(featured.youtubeUrl)} alt={featured.title} sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover transition-transform duration-500 group-hover:scale-105" placeholderLabel="Wideo" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/80 text-white transition-transform group-hover:scale-110"><PlayCircle className="h-9 w-9" /></span>
                </div>
                {featured.duration && <span className="absolute bottom-3 right-3 rounded bg-black/75 px-2 py-1 text-xs font-semibold text-white">{featured.duration}</span>}
              </div>
              <div className="flex flex-col justify-center p-6 lg:col-span-2">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <CategoryTag category={featured.category} />
                  {featured.tournament && <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-bold text-muted-foreground">{featured.tournament}</span>}
                </div>
                <h2 className="text-balance text-xl font-black leading-snug text-ink sm:text-2xl">{featured.title}</h2>
                {featured.players && <p className="mt-2 text-sm text-muted-foreground">{featured.players}</p>}
                {featured.description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/80">{featured.description}</p>}
                <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">{featured.date ? formatDate(featured.date) : ""}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-strong">Oglądaj na YouTube <ExternalLink className="h-3 w-3" /></span>
                </div>
              </div>
            </a>
          )}

          {grid.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((video) => (
                <a key={video.id} href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative aspect-video overflow-hidden">
                    <CoverImage src={youtubeThumb(video.youtubeUrl)} alt={video.title} sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" placeholderLabel="Wideo" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/80 text-white opacity-0 transition-opacity group-hover:opacity-100"><PlayCircle className="h-7 w-7" /></span>
                    </div>
                    {video.duration && <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white">{video.duration}</span>}
                    <div className="absolute left-2 top-2"><CategoryTag category={video.category} /></div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    {video.tournament && <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-strong">{video.tournament}</p>}
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink transition-opacity group-hover:opacity-70">{video.title}</h3>
                    <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                      <span className="truncate">{video.players ?? (video.date ? formatDate(video.date) : "")}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{video.duration ?? "YouTube"}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
