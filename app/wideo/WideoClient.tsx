"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, ExternalLink } from "lucide-react";
import type { SanityVideo } from "@/lib/sanity";

const CATEGORIES = ["Wszystkie", "Highlights", "Full Match", "Interview", "Analysis"];

const categoryColors: Record<string, string> = {
  Highlights: "bg-blue-100 text-blue-800",
  "Full Match": "bg-purple-100 text-purple-800",
  Interview: "bg-green-100 text-green-800",
  Analysis: "bg-orange-100 text-orange-800",
};

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    // youtu.be/<id>
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    // youtube.com/watch?v=<id>
    const v = parsed.searchParams.get("v");
    if (v) return v;
    // youtube.com/embed/<id> or /shorts/<id>
    const match = parsed.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/);
    if (match) return match[1];
  } catch {
    // invalid URL — fall through
  }
  return null;
}

interface Props {
  videos: SanityVideo[];
  tournaments: string[];
}

export default function WideoClient({ videos, tournaments }: Props) {
  const [category, setCategory] = useState("Wszystkie");
  const [tournament, setTournament] = useState("Wszystkie turnieje");

  const allTournaments = ["Wszystkie turnieje", ...tournaments];

  const filtered = videos.filter((v) => {
    const matchCat = category === "Wszystkie" || v.category === category;
    const matchTour = tournament === "Wszystkie turnieje" || v.tournament === tournament;
    return matchCat && matchTour;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                category === cat
                  ? "text-white border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
              style={
                category === cat
                  ? { backgroundColor: "var(--brand)", borderColor: "var(--brand)" }
                  : {}
              }
            >
              {cat}
            </button>
          ))}
        </div>
        {allTournaments.length > 1 && (
          <>
            <div className="h-5 w-px bg-border hidden sm:block self-center" />
            <div className="flex flex-wrap gap-2">
              {allTournaments.map((t) => (
                <button
                  key={t}
                  onClick={() => setTournament(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    tournament === t
                      ? "text-white border-transparent"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                  style={
                    tournament === t
                      ? {
                          backgroundColor: "var(--gold)",
                          borderColor: "var(--gold)",
                          color: "var(--brand)",
                        }
                      : {}
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          key={`empty-${category}-${tournament}`}
          className="anim-switch text-center py-20 text-muted-foreground"
        >
          Brak filmów dla wybranych filtrów.
        </div>
      ) : (
        <div key={`${category}-${tournament}`} className="anim-switch">
          {/* Featured video */}
          {featured && (() => {
            const ytId = extractYouTubeId(featured.youtubeUrl);
            const thumb = ytId
              ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
              : `https://picsum.photos/seed/tennis-vid-featured/900/480`;
            return (
              <a
                href={featured.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block mb-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-xl overflow-hidden border border-border">
                  <div className="relative lg:col-span-3 h-64 lg:h-80 overflow-hidden">
                    <Image
                      src={thumb}
                      alt={featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: "rgba(15,42,27,0.80)" }}
                      >
                        <PlayCircle className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    {featured.duration && (
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                        {featured.duration}
                      </div>
                    )}
                    {featured.category && (
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${categoryColors[featured.category] ?? ""}`}
                        >
                          {featured.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="lg:col-span-2 p-6 flex flex-col justify-center bg-card">
                    {featured.tournament && (
                      <Badge variant="outline" className="w-fit mb-3 text-xs">
                        {featured.tournament}
                      </Badge>
                    )}
                    <h2 className="text-xl font-bold leading-snug mb-3">{featured.title}</h2>
                    {featured.players && (
                      <p className="text-sm text-muted-foreground mb-4">{featured.players}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      {featured.duration ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {featured.duration}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        className="flex items-center gap-1 text-xs font-semibold"
                        style={{ color: "var(--brand)" }}
                      >
                        Oglądaj na YouTube <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })()}

          {/* Video grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((video) => {
                const ytId = extractYouTubeId(video.youtubeUrl);
                const thumb = ytId
                  ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                  : `https://picsum.photos/seed/tennis-vid-${video.id}/600/400`;
                return (
                  <a
                    key={video.id}
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl overflow-hidden border border-border hover:border-border/80 transition-colors bg-card"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={thumb}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: "rgba(15,42,27,0.85)" }}
                        >
                          <PlayCircle className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                          {video.duration}
                        </div>
                      )}
                      {video.category && (
                        <div className="absolute top-2 left-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${categoryColors[video.category] ?? ""}`}
                          >
                            {video.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {video.tournament && (
                        <p className="text-xs text-muted-foreground mb-1">{video.tournament}</p>
                      )}
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">{video.players ?? ""}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
