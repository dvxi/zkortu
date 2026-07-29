import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Clock,
  Trophy,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { surfaceColors, categoryColors } from "@/lib/mock-data";
import { fetchRankings, fetchLiveScores, fetchTournaments } from "@/lib/api-tennis";
import { getAllArticles } from "@/lib/sanity";

function PointsDiff({ diff }: { diff: number }) {
  if (diff > 0)
    return (
      <span className="flex items-center gap-0.5 text-green-600 text-xs font-medium">
        <TrendingUp className="h-3 w-3" />+{diff}
      </span>
    );
  if (diff < 0)
    return (
      <span className="flex items-center gap-0.5 text-red-500 text-xs font-medium">
        <TrendingDown className="h-3 w-3" />
        {diff}
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-muted-foreground text-xs">
      <Minus className="h-3 w-3" />0
    </span>
  );
}

export default async function HomePage() {
  const [atpResult, wtaResult, tourResult, articlesResult, liveResult] =
    await Promise.allSettled([
      fetchRankings("ATP"),
      fetchRankings("WTA"),
      fetchTournaments(),
      getAllArticles(),
      fetchLiveScores(),
    ]);

  const atpPlayers = atpResult.status === "fulfilled" ? atpResult.value : [];
  const wtaPlayers = wtaResult.status === "fulfilled" ? wtaResult.value : [];
  const tournaments = tourResult.status === "fulfilled" ? tourResult.value : [];
  const articles = articlesResult.status === "fulfilled" ? articlesResult.value : [];
  const liveMatches = liveResult.status === "fulfilled" ? liveResult.value : [];

  const liveNow = liveMatches.filter((m) => m.status === "live");
  const featured = articles.find((a) => a.featured) ?? articles[0] ?? null;
  const sideNews = articles.filter((a) => a !== featured).slice(0, 3);
  const upcomingTournaments = tournaments.filter((t) => t.status === "upcoming").slice(0, 4);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative h-[520px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1600&q=80"
          alt="Kort tenisowy"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(15,42,27,0.93) 40%, rgba(15,42,27,0.35) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage:
              "linear-gradient(to right, black 20%, transparent 65%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 20%, transparent 65%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center">
          <div className="max-w-xl">
            <Badge
              className="anim-fade-up mb-4 text-xs font-semibold tracking-widest uppercase border-0"
              style={{ backgroundColor: "var(--gold)", color: "var(--brand)" }}
            >
              Portal tenisowy — Na żywo
            </Badge>
            <h1 className="anim-fade-up anim-delay-1 text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Tenis na
              <br />
              <span style={{ color: "var(--gold)" }}>najwyższym poziomie</span>
            </h1>
            <p className="anim-fade-up anim-delay-2 text-white/75 text-lg leading-relaxed mb-8">
              Wyniki na żywo, rankingi ATP i WTA, kalendarz turniejów
              i najnowsze aktualności ze świata tenisa.
            </p>
            <div className="anim-fade-up anim-delay-3 flex flex-wrap gap-3">
              <Link
                href="/aktualnosci"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "var(--gold)", color: "var(--brand)" }}
              >
                Aktualności <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/wyniki-live"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm text-white border border-white/30 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: "var(--live)" }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: "var(--live)" }}
                  />
                </span>
                Wyniki live
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Score Ticker ── */}
      {liveNow.length > 0 && (
        <div style={{ backgroundColor: "var(--brand-muted)" }} className="border-b border-white/10 overflow-hidden">
          <div className="flex items-stretch h-11">
            <div className="flex items-center gap-2 px-4 flex-shrink-0 border-r border-white/10">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--live)" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "var(--live)" }} />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
                Live
              </span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="ticker-track flex items-center h-full gap-0">
                {[...liveNow, ...liveNow].map((match, i) => (
                  <Link
                    href="/wyniki-live"
                    key={`${match.id}-${i}`}
                    className="flex items-center gap-3 px-5 flex-shrink-0 h-full border-r border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white/45 text-xs font-medium whitespace-nowrap">
                      {match.tournament}
                    </span>
                    <span className="text-white text-sm font-semibold whitespace-nowrap">
                      {match.player1}
                    </span>
                    <div className="flex items-center gap-1">
                      {match.sets.map((set, si) => (
                        <span
                          key={si}
                          className="text-xs font-bold tabular-nums"
                          style={{ color: "var(--gold)" }}
                        >
                          {set.p1}–{set.p2}
                        </span>
                      ))}
                    </div>
                    <span className="text-white text-sm font-semibold whitespace-nowrap">
                      {match.player2}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: News + Tournaments ── */}
          <div className="lg:col-span-2 space-y-8 anim-fade-up anim-delay-2">
            {/* Featured News */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: "var(--brand)" }}>
                  Najnowsze aktualności
                </h2>
                <Link
                  href="/aktualnosci"
                  className="text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
                  style={{ color: "var(--brand)" }}
                >
                  Wszystkie <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {featured ? (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <Link
                    href={`/aktualnosci/${featured.id}`}
                    className="sm:col-span-3 group block rounded-xl overflow-hidden relative"
                  >
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <Image
                        src="https://picsum.photos/seed/tennis-news-iga/800/500"
                        alt={featured.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(to top, rgba(15,42,27,0.88) 30%, transparent)",
                        }}
                      />
                      <div className="absolute bottom-0 p-4">
                        <Badge
                          className="mb-2 text-xs border-0"
                          style={{ backgroundColor: "var(--gold)", color: "var(--brand)" }}
                        >
                          {featured.category}
                        </Badge>
                        <h3 className="font-bold text-white text-lg leading-snug">
                          {featured.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-white/60 text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {featured.readTime} min czytania
                          </span>
                          <span>{featured.author}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="sm:col-span-2 flex flex-col gap-3">
                    {sideNews.map((article, i) => (
                      <Link
                        key={article.id}
                        href={`/aktualnosci/${article.id}`}
                        className="group flex gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="relative w-20 h-16 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={`https://picsum.photos/seed/${["tennis-news-atp","tennis-news-wta","tennis-news-rg"][i] ?? "tennis-news-ao"}/160/128`}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs mb-1 border-muted-foreground/30 text-muted-foreground">
                            {article.category}
                          </Badge>
                          <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity">
                            {article.title}
                          </p>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {article.readTime} min
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak aktualności — dodaj artykuły w panelu CMS.</p>
              )}
            </section>

            {/* Upcoming Tournaments */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: "var(--brand)" }}>
                  Nadchodzące turnieje
                </h2>
                <Link
                  href="/kalendarz"
                  className="text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
                  style={{ color: "var(--brand)" }}
                >
                  Kalendarz <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {upcomingTournaments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingTournaments.map((t) => (
                    <Link href="/kalendarz" key={t.id}>
                      <Card className="hover:border-brand transition-colors cursor-pointer group overflow-hidden border-border/60">
                        <div className="relative h-32 overflow-hidden">
                          <Image
                            src={`https://picsum.photos/seed/tennis-tour-${t.id}/600/300`}
                            alt={t.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(to top, rgba(15,42,27,0.7) 20%, transparent)" }}
                          />
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${categoryColors[t.category]}`}>
                              {t.category}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-sm">{t.flag} {t.name}</h3>
                              <p className="text-xs text-muted-foreground">{t.location}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded border flex-shrink-0 ${surfaceColors[t.surface]}`}>
                              {t.surface}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            <span>
                              {new Date(t.startDate + "T12:00:00").toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                              {" – "}
                              {new Date(t.endDate + "T12:00:00").toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak nadchodzących turniejów.</p>
              )}
            </section>
          </div>

          {/* ── Right Sidebar: Rankings ── */}
          <div className="space-y-8 anim-fade-up anim-delay-3">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--brand)" }}>
                  <Trophy className="h-4 w-4" style={{ color: "var(--gold)" }} />
                  Ranking ATP
                </h2>
                <Link
                  href="/ranking"
                  className="text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "var(--brand)" }}
                >
                  Pełny ranking
                </Link>
              </div>
              {atpPlayers.length > 0 ? (
                <div className="space-y-1">
                  {atpPlayers.slice(0, 8).map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                        player.rank <= 3 ? "bg-muted/50" : "hover:bg-muted/30 transition-colors"
                      }`}
                    >
                      <span
                        className={`w-6 text-center font-bold text-xs flex-shrink-0 ${
                          player.rank === 1 ? "text-yellow-500" :
                          player.rank === 2 ? "text-slate-400" :
                          player.rank === 3 ? "text-amber-600" : "text-muted-foreground"
                        }`}
                      >
                        {player.rank}
                      </span>
                      <span className="flex-1 font-medium truncate">{player.flag} {player.name}</span>
                      <span className="text-xs text-muted-foreground">{player.points.toLocaleString("pl-PL")}</span>
                      <PointsDiff diff={player.pointsDiff} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak danych rankingowych.</p>
              )}
              <Separator className="my-4" />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--brand)" }}>
                  <Trophy className="h-4 w-4" style={{ color: "var(--gold)" }} />
                  Ranking WTA
                </h2>
                <Link
                  href="/ranking"
                  className="text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "var(--brand)" }}
                >
                  Pełny ranking
                </Link>
              </div>
              {wtaPlayers.length > 0 ? (
                <div className="space-y-1">
                  {wtaPlayers.slice(0, 8).map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                        player.rank <= 3 ? "bg-muted/50" : "hover:bg-muted/30 transition-colors"
                      }`}
                    >
                      <span
                        className={`w-6 text-center font-bold text-xs flex-shrink-0 ${
                          player.rank === 1 ? "text-yellow-500" :
                          player.rank === 2 ? "text-slate-400" :
                          player.rank === 3 ? "text-amber-600" : "text-muted-foreground"
                        }`}
                      >
                        {player.rank}
                      </span>
                      <span className="flex-1 font-medium truncate">{player.flag} {player.name}</span>
                      <span className="text-xs text-muted-foreground">{player.points.toLocaleString("pl-PL")}</span>
                      <PointsDiff diff={player.pointsDiff} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Brak danych rankingowych.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
