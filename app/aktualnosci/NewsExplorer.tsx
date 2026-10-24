"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Tag, X } from "lucide-react";
import type { SanityArticleCard, TagSummary } from "@/lib/sanity";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { addDaysIso, formatDate, pluralPl, todayIso } from "@/lib/format";
import { normalizeName } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { ArticleCard } from "@/components/site/ArticleCard";
import { Chip } from "@/components/site/Badges";
import { EmptyState } from "@/components/site/States";

type Period = "all" | "today" | "yesterday" | "week";

const PERIODS: Array<{ id: Period; label: string }> = [
  { id: "all", label: "Wszystkie" },
  { id: "today", label: "Dziś" },
  { id: "yesterday", label: "Wczoraj" },
  { id: "week", label: "Ostatnie 7 dni" },
];

function dateLabel(iso: string, today: string): string {
  if (iso === today) return "Dziś";
  if (iso === addDaysIso(today, -1)) return "Wczoraj";
  return formatDate(iso, { weekday: "long", day: "numeric", month: "long" });
}

interface Props {
  articles: SanityArticleCard[];
  tags: TagSummary[];
}

export function NewsExplorer({ articles, tags }: Props) {
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get("tag");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Wszystkie");
  const [period, setPeriod] = useState<Period>("all");

  const today = todayIso();
  const categories = useMemo(() => {
    const present = new Set(articles.map((a) => a.category));
    return ["Wszystkie", ...ARTICLE_CATEGORIES.filter((c) => present.has(c))];
  }, [articles]);

  const filtered = useMemo(() => {
    const q = normalizeName(query);
    const yesterday = addDaysIso(today, -1);
    const weekAgo = addDaysIso(today, -7);
    return articles.filter((a) => {
      if (category !== "Wszystkie" && a.category !== category) return false;
      if (tagFilter && !(a.tags ?? []).some((t) => normalizeName(t) === normalizeName(tagFilter))) return false;
      if (period === "today" && a.date !== today) return false;
      if (period === "yesterday" && a.date !== yesterday) return false;
      if (period === "week" && a.date < weekAgo) return false;
      if (q && !normalizeName(`${a.title} ${a.excerpt} ${(a.tags ?? []).join(" ")}`).includes(q)) return false;
      return true;
    });
  }, [articles, category, tagFilter, period, query, today]);

  const grouped = useMemo(() => {
    const map = new Map<string, SanityArticleCard[]>();
    for (const a of filtered) {
      const key = (a.date ?? "").slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <div>
      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Szukaj artykułów</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj artykułów…"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand/50"
          />
        </label>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0" role="tablist" aria-label="Okres">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={period === p.id}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-bold transition-colors",
                  period === p.id ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-ink",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        {categories.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)} className="shrink-0">
            {c}
          </Chip>
        ))}
      </div>

      {/* Active tag */}
      {tagFilter && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-soft px-4 py-2.5 text-sm">
          <Tag className="h-4 w-4 text-brand-strong" />
          <span className="text-muted-foreground">Tag:</span>
          <span className="font-bold text-ink">{tagFilter}</span>
          <Link href="/aktualnosci" className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-white hover:text-ink">
            Usuń filtr <X className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Popular tags */}
      {!tagFilter && tags.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground">Popularne tagi:</span>
          {tags.map((t) => (
            <Link key={t.slug} href={`/tag/${t.slug}`} className="rounded-full border border-border bg-card px-2.5 py-1 font-medium text-muted-foreground transition-colors hover:border-brand hover:text-ink">
              {t.tag}
            </Link>
          ))}
        </div>
      )}

      {grouped.length === 0 ? (
        <EmptyState
          title="Nie znaleziono artykułów"
          description={articles.length === 0 ? "Pierwsze artykuły pojawią się po dodaniu ich w panelu redakcji." : "Zmień filtry lub wyczyść wyszukiwanie."}
        />
      ) : (
        <div key={`${category}-${period}-${query}-${tagFilter}`} className="anim-switch space-y-10">
          {grouped.map(([date, list]) => (
            <section key={date} aria-label={dateLabel(date, today)}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-base font-black capitalize text-ink">{dateLabel(date, today)}</h2>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {list.length} {pluralPl(list.length, "artykuł", "artykuły", "artykułów")}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((a) => (
                  <ArticleCard key={a._id} article={a} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
