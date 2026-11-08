import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Trophy } from "lucide-react";
import { fetchPlayerMatches, fetchPlayerProfile, fetchRankings } from "@/lib/api-tennis";
import { countryFromCode } from "@/lib/countries";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { formatDate, formatDateShort, formatPoints, pluralPl, slugify, todayIso } from "@/lib/format";
import { getArticlesByTag, getPlayerBySlug, getPlayerProfileIndex, type PlayerProfileLink, type SanityPlayer } from "@/lib/sanity";
import { imageUrl } from "@/lib/sanity-image";
import type { LiveMatch, Player, PlayerApiProfile, PlayerSeason } from "@/lib/types";
import { ArticleCard } from "@/components/site/ArticleCard";
import { SurfaceBadge, TourBadge } from "@/components/site/Badges";
import { Flag } from "@/components/site/Flag";
import { MatchRow } from "@/components/site/MatchRow";
import { PlayerAvatar } from "@/components/site/PlayerAvatar";
import { MovementIcon } from "@/components/site/RankingWidget";
import { ErrorState } from "@/components/site/States";

export const revalidate = 3600;
export const dynamicParams = true;

// profiles render on first visit and are then cached (keeps builds free of ~800 API calls)
export async function generateStaticParams() {
  return [];
}

async function safe<T>(label: string, p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    console.error(`[player ${label}]`, String(err));
    return null;
  }
}

function ageFrom(birthDate: string, today: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

function playStyle(p: SanityPlayer): string | null {
  const female = p.tour === "WTA";
  const hand = p.plays === "right" ? (female ? "praworęczna" : "praworęczny") : p.plays === "left" ? (female ? "leworęczna" : "leworęczny") : null;
  const backhand = p.backhand === "two" ? "bekhend oburęczny" : p.backhand === "one" ? "bekhend jednoręczny" : null;
  const text = [hand, backhand].filter(Boolean).join(", ");
  return text ? text[0].toUpperCase() + text.slice(1) : null;
}

const record = ([w, l]: [number, number]) => (w || l ? `${w}–${l}` : "—");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) return { title: "Nie znaleziono zawodnika" };
  const country = countryFromCode(player.countryCode).namePl;
  const title = `${player.name}: ranking, wyniki, statystyki`;
  const description = `${player.name} (${[country, player.tour].filter(Boolean).join(", ")}): aktualny ranking, ostatnie mecze, statystyki sezon po sezonie, tytuły i wiadomości.`;
  const og = imageUrl(player.photo, 1200, 630);
  return {
    title,
    description,
    alternates: { canonical: `/zawodnicy/${player.slug}` },
    openGraph: { type: "profile", title, description, url: `${SITE_URL}/zawodnicy/${player.slug}`, siteName: SITE_NAME, locale: "pl_PL", images: og ? [{ url: og, width: 1200, height: 630, alt: player.name }] : undefined },
  };
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-semibold text-ink">{children}</dd>
    </div>
  );
}

function SeasonTable({ seasons, currentYear }: { seasons: PlayerSeason[]; currentYear: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[560px] text-sm">
        <caption className="sr-only">Statystyki w singlu sezon po sezonie</caption>
        <thead>
          <tr className="bg-ink text-left text-[11px] font-bold uppercase tracking-wider text-ink-foreground/70">
            <th scope="col" className="px-4 py-3">Sezon</th>
            <th scope="col" className="px-3 py-3 text-right">Ranking</th>
            <th scope="col" className="px-3 py-3 text-right">Bilans</th>
            <th scope="col" className="px-3 py-3 text-right">Twarda</th>
            <th scope="col" className="px-3 py-3 text-right">Mączka</th>
            <th scope="col" className="px-3 py-3 text-right">Trawa</th>
            <th scope="col" className="px-4 py-3 text-right">Tytuły</th>
          </tr>
        </thead>
        <tbody className="tabular">
          {seasons.map((s) => (
            <tr key={s.season} className="border-t border-border">
              <th scope="row" className="px-4 py-2.5 text-left font-bold text-ink">
                {s.season}
                {s.season === currentYear && <span className="ml-1.5 text-[10px] font-semibold uppercase text-muted-foreground">w trakcie</span>}
              </th>
              <td className="px-3 py-2.5 text-right font-semibold">{s.rank ? `#${s.rank}` : "—"}</td>
              <td className="px-3 py-2.5 text-right font-bold text-ink">{record([s.won, s.lost])}</td>
              <td className="px-3 py-2.5 text-right text-muted-foreground">{record(s.hard)}</td>
              <td className="px-3 py-2.5 text-right text-muted-foreground">{record(s.clay)}</td>
              <td className="px-3 py-2.5 text-right text-muted-foreground">{record(s.grass)}</td>
              <td className="px-4 py-2.5 text-right font-semibold">{s.titles || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchList({ matches, profiles }: { matches: LiveMatch[]; profiles: Record<string, PlayerProfileLink> }) {
  return (
    <ul className="space-y-2">
      {matches.map((m) => (
        <li key={m.id} className="rounded-xl border border-border bg-card p-3">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {formatDateShort(m.date)}
            {m.isQualifying ? " · kwalifikacje" : ""}
          </p>
          <MatchRow match={m} profiles={profiles} />
        </li>
      ))}
    </ul>
  );
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) notFound();

  const today = todayIso();
  const currentYear = Number(today.slice(0, 4));
  const tag = player.tag?.trim() || player.name;
  const [api, matches, ranking, articles, profileIndex] = await Promise.all([
    safe<PlayerApiProfile | null>("profile", fetchPlayerProfile(player.apiPlayerKey)),
    safe<LiveMatch[]>("matches", fetchPlayerMatches(player.apiPlayerKey, today)),
    safe<Player[]>("ranking", fetchRankings(player.tour)),
    getArticlesByTag(tag),
    getPlayerProfileIndex(),
  ]);

  const { [player.apiPlayerKey]: _self, ...profiles } = profileIndex;
  void _self;
  const country = countryFromCode(player.countryCode);
  const countryLabel = country.namePl || (player.tour === "WTA" ? "Zawodniczka neutralna" : "Zawodnik neutralny");
  const rank = ranking?.find((p) => p.playerKey === player.apiPlayerKey) ?? null;
  const season = api?.singles.find((s) => s.season === currentYear) ?? null;
  const titles = api?.singlesTitles ?? [];
  const recent = (matches ?? []).slice(0, 12);
  const female = player.tour === "WTA";
  const age = api?.birthDate ? ageFrom(api.birthDate, today) : null;
  const links = [
    { href: player.website, label: "Strona www" },
    { href: player.instagram, label: "Instagram" },
    { href: player.x, label: "X" },
    { href: player.facebook, label: "Facebook" },
  ].filter((l): l is { href: string; label: string } => Boolean(l.href));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    url: `${SITE_URL}/zawodnicy/${player.slug}`,
    jobTitle: female ? "Tenisistka" : "Tenisista",
    nationality: country.namePl || undefined,
    birthDate: api?.birthDate ?? undefined,
    birthPlace: player.birthplace ?? undefined,
    height: player.height ? `${player.height} cm` : undefined,
    image: imageUrl(player.photo, 800, 800) ?? undefined,
    sameAs: links.length ? links.map((l) => l.href) : undefined,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/zawodnicy" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Wszyscy zawodnicy
      </Link>

      {/* Header */}
      <header className="mb-8 flex flex-col gap-5 rounded-3xl bg-ink p-5 text-ink-foreground sm:flex-row sm:items-center sm:p-7">
        <PlayerAvatar name={player.name} photo={player.photo} size={112} className="ring-4 ring-brand/40" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <TourBadge tour={player.tour} />
            {player.countryCode === "PL" && <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-black uppercase text-brand-foreground">PL</span>}
          </div>
          <h1 className="text-3xl font-black tracking-[-0.02em] sm:text-4xl">{player.name}</h1>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-white/75">
            <Flag flag={country.flag} country={country.namePl} className="text-lg" />
            {countryLabel}
            {age !== null && <span>· {age} {pluralPl(age, "rok", "lata", "lat")}</span>}
          </p>
          {player.photo?.credit && <p className="mt-1 text-[10px] text-white/45">Fot. {player.photo.credit}</p>}
        </div>
        <div className="flex gap-6 sm:text-right">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">Ranking {player.tour}</p>
            <p className="tabular mt-1 flex items-center gap-2 text-4xl font-black sm:justify-end">
              {rank ? `#${rank.rank}` : "—"}
              {rank && <MovementIcon movement={rank.movement} className="h-5 w-5" />}
            </p>
            {rank && <p className="tabular text-xs text-white/60">{formatPoints(rank.points)} pkt</p>}
          </div>
          {season && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-brand">Sezon {currentYear}</p>
              <p className="tabular mt-1 text-4xl font-black">{season.won}–{season.lost}</p>
              <p className="text-xs text-white/60">{season.titles} {pluralPl(season.titles, "tytuł", "tytuły", "tytułów")}</p>
            </div>
          )}
        </div>
      </header>

      {!api && !matches && <ErrorState compact className="mb-8" title="Statystyki chwilowo niedostępne" description="Dostawca danych nie odpowiada. Spróbuj ponownie za kilka minut." />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {player.bio && <p className="whitespace-pre-line text-base leading-relaxed text-foreground/85">{player.bio}</p>}

          {recent.length > 0 && (
            <section aria-labelledby="player-matches">
              <h2 id="player-matches" className="mb-4 text-xl font-black text-ink">Ostatnie mecze</h2>
              <MatchList matches={recent} profiles={profiles} />
            </section>
          )}

          {api && api.singles.length > 0 && (
            <section aria-labelledby="player-seasons">
              <h2 id="player-seasons" className="mb-4 text-xl font-black text-ink">Statystyki w singlu</h2>
              <SeasonTable seasons={api.singles.slice(0, 10)} currentYear={currentYear} />
              <p className="mt-2 text-xs text-muted-foreground">Ranking: pozycja na koniec sezonu, w bieżącym sezonie aktualna.</p>
            </section>
          )}
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="player-facts" className="overflow-hidden rounded-2xl border border-border bg-card">
            <h2 id="player-facts" className="border-b border-border px-4 py-3 text-sm font-black uppercase tracking-wider text-ink">{female ? "O zawodniczce" : "O zawodniku"}</h2>
            <dl className="divide-y divide-border">
              {rank && <Fact label={`Ranking ${player.tour}`}>#{rank.rank}</Fact>}
              {player.careerHigh && <Fact label="Najwyższy w karierze">#{player.careerHigh}{player.careerHighDate ? ` (${formatDate(player.careerHighDate, { month: "long", year: "numeric" })})` : ""}</Fact>}
              {api?.birthDate && <Fact label="Data urodzenia">{formatDate(api.birthDate, { day: "numeric", month: "long", year: "numeric" })}</Fact>}
              {player.birthplace && <Fact label="Miejsce urodzenia">{player.birthplace}</Fact>}
              {player.height && <Fact label="Wzrost">{player.height} cm</Fact>}
              {playStyle(player) && <Fact label="Gra">{playStyle(player)}</Fact>}
              {player.coach && <Fact label="Trener">{player.coach}</Fact>}
              {api && <Fact label="Tytuły w singlu">{titles.length}</Fact>}
            </dl>
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-border p-4">
                {links.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">
                    {l.label} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            )}
          </section>

          {titles.length > 0 && (
            <section aria-labelledby="player-titles" className="overflow-hidden rounded-2xl border border-border bg-card">
              <h2 id="player-titles" className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-black uppercase tracking-wider text-ink">
                <Trophy className="h-4 w-4 text-brand" /> Tytuły ({titles.length})
              </h2>
              <ul className="divide-y divide-border">
                {titles.slice(0, 12).map((t, i) => (
                  <li key={`${t.season}-${t.name}-${i}`} className="flex items-center gap-3 px-4 py-2 text-sm">
                    <span className="tabular w-10 text-xs font-bold text-muted-foreground">{t.season}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-ink">{t.name}</span>
                    {t.surface && <SurfaceBadge surface={t.surface} />}
                  </li>
                ))}
              </ul>
              {titles.length > 12 && <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">i {titles.length - 12} wcześniejszych</p>}
            </section>
          )}
        </aside>
      </div>

      {articles.length > 0 && (
        <section aria-labelledby="player-news" className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 id="player-news" className="text-xl font-black text-ink">Wiadomości: {player.name}</h2>
            <Link href={`/tag/${slugify(tag)}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-strong hover:opacity-70">
              Wszystkie <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 6).map((a) => <ArticleCard key={a._id} article={a} />)}
          </div>
        </section>
      )}

      <p className="mt-10 text-xs text-muted-foreground">Ranking, statystyki i mecze: API-Tennis, aktualizacja automatyczna.</p>
    </div>
  );
}
