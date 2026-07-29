"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Search, User } from "lucide-react";
import { newsArticles as mockArticles, type NewsArticle } from "@/lib/mock-data";

const categories = ["Wszystkie", "ATP", "WTA", "Roland Garros", "Wimbledon", "Transfer", "Polska", "Juniorzy"];

const newsImageSeeds = [
  "tennis-news-iga",
  "tennis-news-atp",
  "tennis-news-wta",
  "tennis-news-rg",
  "tennis-news-wb",
  "tennis-news-ao",
  "tennis-news-junior",
  "tennis-news-transfer",
  "tennis-news-poland",
  "tennis-news-clay",
];

function getDateLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Dziś";
  if (dateStr === yesterday) return "Wczoraj";
  if (dateStr === dayBefore) return "Przedwczoraj";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
}

export default function AktualnosciPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const [tab, setTab] = useState("wszystkie");
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(mockArticles);

  useEffect(() => {
    fetch("/api/articles")
      .then(async (r) => {
        if (r.status === 204) return null;
        if (!r.ok) return null;
        const data = await r.json();
        return Array.isArray(data) && data.length > 0 ? data : null;
      })
      .then((d: NewsArticle[] | null) => { if (d) setNewsArticles(d); })
      .catch(() => {});
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const weekAgoStr = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const filtered = newsArticles.filter((a) => {
    const matchesCategory = category === "Wszystkie" || a.category === category;
    const matchesSearch =
      search === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      tab === "wszystkie" ||
      (tab === "dzisiaj" && a.date === todayStr) ||
      (tab === "wczoraj" && a.date === yesterdayStr) ||
      (tab === "tydzien" && a.date >= weekAgoStr);
    return matchesCategory && matchesSearch && matchesTab;
  });

  const grouped = filtered.reduce<Record<string, typeof newsArticles>>((acc, article) => {
    const d = article.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(article);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <>
      {/* ── Hero strip ── */}
      <section
        className="relative py-14 px-4 sm:px-6 overflow-hidden"
        style={{ backgroundColor: "var(--brand)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to right, black 20%, transparent 70%)",
            WebkitMaskImage: "linear-gradient(to right, black 20%, transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto">
          <p className="anim-fade-up text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--gold)" }}>
            Redakcja
          </p>
          <h1 className="anim-fade-up anim-delay-1 text-4xl sm:text-5xl font-black text-white mb-3">
            Aktualności
          </h1>
          <p className="anim-fade-up anim-delay-2 text-white/65 text-lg max-w-lg">
            Najnowsze wiadomości ze świata tenisa — wyniki, transfery, relacje z turniejów.
          </p>
        </div>
      </section>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj artykułów..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="gap-1 p-1">
            <TabsTrigger value="wszystkie" className="px-5">Wszystkie</TabsTrigger>
            <TabsTrigger value="dzisiaj" className="px-5">Dziś</TabsTrigger>
            <TabsTrigger value="wczoraj" className="px-5">Wczoraj</TabsTrigger>
            <TabsTrigger value="tydzien" className="px-5">Poprzednie</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              category === cat
                ? "text-white border-transparent"
                : "border-border text-muted-foreground hover:border-brand/50 hover:text-foreground"
            }`}
            style={category === cat ? { backgroundColor: "var(--brand)", borderColor: "var(--brand)" } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles grouped by date */}
      {sortedDates.length === 0 ? (
        <div key={`empty-${tab}-${category}`} className="anim-switch text-center py-20 text-muted-foreground">
          Nie znaleziono artykułów spełniających kryteria.
        </div>
      ) : (
        <div key={`${tab}-${category}-${search}`} className="anim-switch space-y-10">
          {sortedDates.map((date) => (
            <section key={date}>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-bold" style={{ color: "var(--brand)" }}>
                  {getDateLabel(date)}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{grouped[date].length} artykułów</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {grouped[date].map((article, idx) => (
                  <Link
                    key={article.id}
                    href={`/aktualnosci/${article.id}`}
                    className="group block rounded-xl overflow-hidden border border-border/60 hover:border-border transition-all hover:-translate-y-1 bg-card"
                    style={{ transitionDuration: "200ms" }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={`https://picsum.photos/seed/${newsImageSeeds[newsArticles.indexOf(article) % newsImageSeeds.length]}/600/400`}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          className="text-xs border-0 font-semibold"
                          style={{ backgroundColor: "var(--gold)", color: "var(--brand)" }}
                        >
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm leading-snug mb-2 group-hover:opacity-70 transition-opacity line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
