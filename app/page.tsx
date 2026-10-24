import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { ApiTennisError, describeApiError, fetchLiveScores, fetchRankings } from "@/lib/api-tennis";
import type { LiveMatch } from "@/lib/types";
import { getAllArticles, getAllVideos, getTournaments } from "@/lib/sanity";
import type { Player } from "@/lib/types";
import { videoCategoryLabel } from "@/lib/constants";
import { ArticleCard } from "@/components/site/ArticleCard";
import { CoverImage } from "@/components/site/CoverImage";
import { LiveTicker } from "@/components/site/LiveTicker";
import { RankingWidget } from "@/components/site/RankingWidget";
import { SectionHeading } from "@/components/site/SectionHeading";
import { EmptyState } from "@/components/site/States";
import { TournamentCard } from "@/components/site/TournamentCard";
import { extractYouTubeId } from "@/app/wideo/youtube";

export const revalidate = 60;

async function loadRanking(tour: "ATP" | "WTA"): Promise<{ players: Player[]; error: string | null }> {
  try {
    return { players: await fetchRankings(tour), error: null };
  } catch (err) {
    (err instanceof ApiTennisError && err.code === "no-key" ? console.warn : console.error)(`[home ranking:${tour}]`, String(err));
    return { players: [], error: describeApiError(err) };
  }
}

async function loadLive(): Promise<LiveMatch[]> {
  try {
    return await fetchLiveScores("tour", { revalidate: 60, tags: ["live"] });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [articles, tournaments, atp, wta, videos, live] = await Promise.all([
    getAllArticles(12),
    getTournaments(),
    loadRanking("ATP"),
    loadRanking("WTA"),
    getAllVideos(),
    loadLive(),
  ]);

  const featured = articles.find((a) => a.featured) ?? articles[0] ?? null;
  const rest = articles.filter((a) => a !== featured);
  const sideNews = rest.slice(0, 4);
  const moreNews = rest.slice(4, 10);

  const liveTournaments = tournaments.filter((t) => t.status === "live");
  const upcomingTournaments = tournaments.filter((t) => t.status === "upcoming").sort((a, b) => a.startDate.localeCompare(b.startDate));
  const spotlight = [...liveTournaments, ...upcomingTournaments].slice(0, 4);
  const latestVideos = videos.slice(0, 3);

  return (
    <div>
      <LiveTicker initial={live} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
          {/* ── Main column ─────────────────────────────────────────────── */}
          <div className="space-y-12 lg:col-span-2">
            <section aria-labelledby="home-news">
              <SectionHeading title="Najnowsze aktualności" href="/aktualnosci" />
              {featured ? (
                <ArticleCard article={featured} variant="featured" priority />
              ) : (
                <EmptyState title="Wkrótce pierwsze materiały" description="Redakcja przygotowuje pierwsze artykuły." />
              )}
              {/* side news on small screens */}
              {sideNews.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:hidden">
                  {sideNews.map((a) => (
                    <ArticleCard key={a._id} article={a} variant="row" />
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="home-tournaments">
              <SectionHeading title={liveTournaments.length > 0 ? "Trwające i najbliższe turnieje" : "Najbliższe turnieje"} href="/kalendarz" linkLabel="Kalendarz" live={liveTournaments.length > 0} />
              {spotlight.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {spotlight.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                  ))}
                </div>
              ) : (
                <EmptyState compact title="Kalendarz turniejów w przygotowaniu" description="Najbliższe turnieje pojawią się tutaj automatycznie." />
              )}
            </section>

            {moreNews.length > 0 && (
              <section aria-labelledby="home-more">
                <SectionHeading title="Więcej z redakcji" href="/aktualnosci" />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {moreNews.map((a) => (
                    <ArticleCard key={a._id} article={a} />
                  ))}
                </div>
              </section>
            )}

            {latestVideos.length > 0 && (
              <section aria-labelledby="home-video">
                <SectionHeading title="Wideo" href="/wideo" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {latestVideos.map((v) => {
                    const ytId = extractYouTubeId(v.youtubeUrl);
                    return (
                      <a key={v.id} href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-0.5 hover:shadow-md">
                        <div className="relative aspect-video overflow-hidden">
                          <CoverImage src={ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null} alt={v.title} sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" placeholderLabel="Wideo" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/80 text-white transition-transform group-hover:scale-110"><PlayCircle className="h-6 w-6" /></span>
                          </div>
                          {v.duration && <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white">{v.duration}</span>}
                        </div>
                        <div className="p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-strong">{videoCategoryLabel(v.category ?? undefined) || "Wideo"}</p>
                          <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-ink">{v.title}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="space-y-8">
            {sideNews.length > 0 && (
              <section className="hidden lg:block" aria-labelledby="home-side-news">
                <SectionHeading title="Więcej aktualności" href="/aktualnosci" size="md" />
                <div className="space-y-1">
                  {sideNews.map((a) => (
                    <ArticleCard key={a._id} article={a} variant="row" />
                  ))}
                </div>
              </section>
            )}

            <RankingWidget tour="ATP" players={atp.players} error={atp.error} />
            <RankingWidget tour="WTA" players={wta.players} error={wta.error} />

            <Link href="/wyniki-live" className="group flex items-center justify-between rounded-2xl bg-ink p-5 text-ink-foreground transition-colors hover:bg-ink-muted">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-brand"><span className="live-dot" aria-hidden="true" /> Na żywo</p>
                <p className="mt-1 text-base font-bold">Wyniki meczów i plan dnia</p>
              </div>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
