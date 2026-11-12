import type { CSSProperties } from "react";
import { slugify } from "@/lib/format";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { ApiTennisError, describeApiError, fetchLiveScores, fetchRankings } from "@/lib/api-tennis";
import type { LiveMatch } from "@/lib/types";
import { getAllArticles, getAllVideos, getTournaments, getSiteSettings, getFeaturedArticle, getEditorialArticles, getPlayerProfileIndex } from "@/lib/sanity";
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
import { getPolishMatches, type PolishMatchesDay } from "@/lib/polish-matches";
import { PolishMatchesWidget } from "@/components/site/PolishMatchesWidget";

export const revalidate = 60;

const HOME_SECTIONS = ["news", "polish", "wta", "editorial", "tournaments", "atp", "video"];

/** Editor's mobile order; sections added after it was saved go next to their default neighbour. */
function mobileOrder(saved: string[] | null | undefined): string[] {
  const order = [...new Set((saved ?? []).filter((k) => HOME_SECTIONS.includes(k)))];
  HOME_SECTIONS.forEach((key, i) => {
    if (order.includes(key)) return;
    const prev = HOME_SECTIONS.slice(0, i).reverse().find((k) => order.includes(k));
    order.splice(prev ? order.indexOf(prev) + 1 : 0, 0, key);
  });
  return order;
}

async function loadPolishMatches(): Promise<PolishMatchesDay | null> {
  try {
    return await getPolishMatches();
  } catch (err) {
    (err instanceof ApiTennisError && err.code === "no-key" ? console.warn : console.error)("[home polish matches]", String(err));
    return null;
  }
}

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
  const [articles, tournaments, atp, wta, videos, live, settings, markedFeatured, polish, profiles] = await Promise.all([
    getAllArticles(12),
    getTournaments(),
    loadRanking("ATP"),
    loadRanking("WTA"),
    getAllVideos(),
    loadLive(),
    getSiteSettings(),
    getFeaturedArticle(),
    loadPolishMatches(),
    getPlayerProfileIndex(),
  ]);

  const featured = settings?.featuredArticle?.id ? settings.featuredArticle : markedFeatured ?? articles[0] ?? null;
  const order = mobileOrder(settings?.mobileHomeOrder);
  const mobileStyle = (key: string) => ({ "--mobile-order": order.indexOf(key) } as CSSProperties);
  const editorial = await Promise.all((settings?.editorialSections ?? []).map(async (section) => ({
    ...section, articles: await getEditorialArticles(section.tag, section.category),
  })));
  const rest = articles.filter((a) => a._id !== featured?._id);
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
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-3 lg:gap-8">
          {/* ── Main column ─────────────────────────────────────────────── */}
          <div className="contents lg:block lg:space-y-12 lg:col-span-2">
            <section aria-label="Aktualności" className="home-section" style={mobileStyle("news")}>
              {featured ? (
                <ArticleCard article={featured} variant="featured" home priority />
              ) : (
                <EmptyState title="Wkrótce pierwsze materiały" description="Redakcja przygotowuje pierwsze artykuły." />
              )}
              {/* side news on small screens */}
              {sideNews.length > 0 && (
                <div className="mt-6 lg:hidden">
                  <SectionHeading title="Więcej aktualności" href="/aktualnosci" size="md" className="mb-2" />
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {sideNews.map((a) => (
                      <ArticleCard key={a._id} article={a} variant="row" home />
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section aria-label="Turnieje" className="home-section" style={mobileStyle("tournaments")}>
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

            {editorial.length === 0 && moreNews.length > 0 && (
              <section aria-label="Więcej z redakcji" className="home-section" style={mobileStyle("editorial")}>
                <SectionHeading title="Więcej z redakcji" href="/aktualnosci" />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {moreNews.map((a) => (
                    <ArticleCard key={a._id} article={a} home />
                  ))}
                </div>
              </section>
            )}

            {editorial.length > 0 && (
              <div className="home-section space-y-12" style={mobileStyle("editorial")}>
                {editorial.map((section) => (
                  <section key={section._key} aria-label={section.title}>
                    <SectionHeading title={section.title} href={section.tag ? `/tag/${slugify(section.tag)}` : "/aktualnosci"} />
                    {section.articles.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {section.articles.map((article) => <ArticleCard key={article._id} article={article} home />)}
                    </div> : <EmptyState compact title="Wkrótce nowe artykuły" />}
                  </section>
                ))}
              </div>
            )}

            {latestVideos.length > 0 && (
              <section aria-label="Wideo" className="home-section" style={mobileStyle("video")}>
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
          {/* desktop order: more news → Polish matches → WTA → ATP → live; mobile order comes from --mobile-order */}
          <aside className="contents lg:block lg:space-y-8">
            {sideNews.length > 0 && (
              <section className="hidden lg:block" aria-labelledby="home-side-news">
                <SectionHeading title="Więcej aktualności" href="/aktualnosci" size="md" />
                <div className="space-y-1">
                  {sideNews.map((a) => (
                    <ArticleCard key={a._id} article={a} variant="row" home />
                  ))}
                </div>
              </section>
            )}

            {polish && (
              <div className="home-section" style={mobileStyle("polish")}>
                <PolishMatchesWidget day={polish} profiles={profiles} />
              </div>
            )}

            <div className="home-section" style={mobileStyle("wta")}><RankingWidget tour="WTA" players={wta.players} error={wta.error} profiles={profiles} /></div>
            <div className="home-section" style={mobileStyle("atp")}><RankingWidget tour="ATP" players={atp.players} error={atp.error} profiles={profiles} /></div>

            <Link href="/wyniki-live" className="order-last group flex items-center justify-between rounded-2xl bg-ink p-5 text-ink-foreground transition-colors hover:bg-ink-muted">
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
