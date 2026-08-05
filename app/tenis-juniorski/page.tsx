import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Trophy, Star, CalendarDays } from "lucide-react";
import type { Player } from "@/lib/mock-data";
import { getAllJuniorPlayers, juniorToPlayer } from "@/lib/sanity";

function PointsDiff({ diff }: { diff: number }) {
  if (diff > 0)
    return (
      <span className="flex items-center gap-0.5 text-green-600 text-xs font-semibold">
        <TrendingUp className="h-3 w-3" />+{diff}
      </span>
    );
  if (diff < 0)
    return (
      <span className="flex items-center gap-0.5 text-red-500 text-xs font-semibold">
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

const juniorNews = [
  {
    id: "jn1",
    title: "Maja Chwalińska triumfuje w Barcelonie — nowe nadzieje polskiego tenisa",
    excerpt: "Siedemnastolatka z Wrocławia wygrała prestiżowy turniej juniorski ITF Grade A, pokonując w finale rywalkę z Czech 6-3, 6-4.",
    date: "2026-05-31",
    imageId: "tennis-junior-maja",
  },
  {
    id: "jn2",
    title: "Kacper Żuk — juniorska sensacja sezonu 2026",
    excerpt: "Szesnastolatek z Gdańska notuje znakomite wyniki na turniejach ITF, awansując do Top 5 rankingu juniorów ATP.",
    date: "2026-05-28",
    imageId: "tennis-junior-kacper",
  },
  {
    id: "jn3",
    title: "Program stypendialny PZT — wsparcie dla utalentowanych juniorów",
    excerpt: "Polski Związek Tenisowy ogłasza rozszerzenie programu stypendialnego dla zawodników do lat 18 na sezon 2026/2027.",
    date: "2026-05-25",
    imageId: "tennis-junior-pzt",
  },
];

const juniorTournaments = [
  { name: "Roland Garros Juniors", date: "26 maj – 8 cze 2026", surface: "Clay", category: "Grade A", flag: "🇫🇷", status: "live" as const },
  { name: "Wimbledon Juniors", date: "29 cze – 12 lip 2026", surface: "Grass", category: "Grade A", flag: "🇬🇧", status: "upcoming" as const },
  { name: "US Open Juniors", date: "24 sie – 7 wrz 2026", surface: "Hard", category: "Grade A", flag: "🇺🇸", status: "upcoming" as const },
  { name: "Junior Fed Cup", date: "12–18 lip 2026", surface: "Clay", category: "Grade 1", flag: "🌍", status: "upcoming" as const },
];

const surfaceColors: Record<string, string> = {
  Clay: "bg-orange-100 text-orange-700",
  Grass: "bg-green-100 text-green-700",
  Hard: "bg-blue-100 text-blue-700",
};

function RankingCard({ title, players }: { title: string; players: Player[] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border" style={{ backgroundColor: "var(--brand)" }}>
        <h3 className="font-bold text-white flex items-center gap-2">
          <Trophy className="h-4 w-4" style={{ color: "var(--gold)" }} />
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border bg-card">
        {players.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">Brak danych rankingowych.</p>
        ) : (
          players.map((player) => (
            <div
              key={player.rank}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm ${player.rank <= 3 ? "bg-muted/30" : "hover:bg-muted/20 transition-colors"}`}
            >
              <span
                className={`w-5 text-center font-bold text-xs ${
                  player.rank === 1 ? "text-yellow-500" : player.rank === 2 ? "text-slate-400" : player.rank === 3 ? "text-amber-600" : "text-muted-foreground"
                }`}
              >
                {player.rank}
              </span>
              <span className="flex-1 font-medium truncate">
                {player.flag} {player.name}
                {player.country === "Polska" && (
                  <span className="ml-1.5 text-xs" style={{ color: "var(--gold)" }}>★</span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">{player.points}p</span>
              <PointsDiff diff={player.pointsDiff} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default async function TenisJuniorskiPage() {
  const [sanityBoys, sanityGirls] = await Promise.all([
    getAllJuniorPlayers("Boys"),
    getAllJuniorPlayers("Girls"),
  ]);

  const boysPlayers: Player[] = sanityBoys.map(juniorToPlayer);
  const girlsPlayers: Player[] = sanityGirls.map(juniorToPlayer);

  const rankingDate = sanityBoys[0]?.rankingDate ?? sanityGirls[0]?.rankingDate ?? null;

  return (
    <div>
      {/* Hero */}
      <section className="relative h-72 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1587683437362-da7775ffc532?w=1400&q=80"
          alt="Tenis juniorski"
          fill
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(15,42,27,0.93) 40%, rgba(15,42,27,0.35) 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "linear-gradient(to right, black 20%, transparent 65%)",
            WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 65%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center">
          <div className="anim-fade-up flex items-center gap-2 mb-3">
            <Star className="h-5 w-5" style={{ color: "var(--gold)" }} />
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
              Tenis juniorski
            </span>
          </div>
          <h1 className="anim-fade-up anim-delay-1 text-4xl font-black text-white mb-3">
            Gwiazdy przyszłości
          </h1>
          <p className="anim-fade-up anim-delay-2 text-white/70 max-w-lg">
            Śledź rankingi, wyniki i aktualności tenisa juniorskiego. Tutaj rodzą się przyszłe kariery.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Rankings side by side */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black" style={{ color: "var(--brand)" }}>
                  Rankingi juniorów ITF
                </h2>
                {rankingDate && (
                  <span className="text-xs text-muted-foreground">
                    Aktualizacja: {new Date(rankingDate).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <RankingCard title="Ranking Chłopców ITF" players={boysPlayers} />
                <RankingCard title="Ranking Dziewcząt ITF" players={girlsPlayers} />
              </div>
            </section>

            {/* Junior News */}
            <section>
              <h2 className="text-xl font-black mb-5" style={{ color: "var(--brand)" }}>
                Aktualności juniorskie
              </h2>
              <div className="space-y-4">
                {juniorNews.map((article) => (
                  <div key={article.id} className="group flex gap-4 p-4 rounded-xl border border-border hover:border-border/80 bg-card hover:bg-muted/10 transition-all cursor-pointer">
                    <div className="relative w-24 h-18 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={`https://picsum.photos/seed/${article.imageId}/200/150`}
                        alt={article.title}
                        width={96}
                        height={72}
                        className="object-cover h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm leading-snug mb-1.5 group-hover:opacity-70 transition-opacity">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(article.date).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar: upcoming tournaments */}
          <div>
            <h2 className="text-base font-bold mb-4" style={{ color: "var(--brand)" }}>
              Turnieje juniorskie
            </h2>
            <div className="space-y-3">
              {juniorTournaments.map((t, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{t.flag}</span>
                    <div className="flex gap-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${surfaceColors[t.surface]}`}>
                        {t.surface}
                      </span>
                      {t.status === "live" && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: "var(--live)" }}
                        >
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-sm">{t.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    {t.date}
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {t.category}
                  </Badge>
                </div>
              ))}
            </div>

            <div
              className="mt-6 p-5 rounded-xl text-white"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <Star className="h-6 w-6 mb-2" style={{ color: "var(--gold)" }} />
              <h3 className="font-bold mb-1">Program PZT dla juniorów</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Polski Związek Tenisowy oferuje stypendia i dofinansowanie podróży dla zawodników do lat 18.
              </p>
              <a
                href="https://www.pzt.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-xs font-semibold inline-block hover:opacity-80 transition-opacity"
                style={{ color: "var(--gold)" }}
              >
                Dowiedz się więcej →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
