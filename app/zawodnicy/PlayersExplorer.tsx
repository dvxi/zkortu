"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { SanityImage } from "@/lib/sanity-image";
import { normalizeName } from "@/lib/countries";
import { Chip } from "@/components/site/Badges";
import { Flag } from "@/components/site/Flag";
import { PlayerAvatar } from "@/components/site/PlayerAvatar";
import { EmptyState } from "@/components/site/States";

export interface PlayerListItem {
  slug: string;
  name: string;
  tour: "ATP" | "WTA";
  countryCode: string;
  countryName: string;
  flag: string;
  rank: number | null;
  photo?: SanityImage | null;
}

type Filter = "all" | "PL" | "WTA" | "ATP";

const byRank = (a: PlayerListItem, b: PlayerListItem) => (a.rank ?? 1e6) - (b.rank ?? 1e6) || a.name.localeCompare(b.name, "pl");

function PlayerCard({ p }: { p: PlayerListItem }) {
  return (
    <Link href={`/zawodnicy/${p.slug}`} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-transform hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md">
      <PlayerAvatar name={p.name} photo={p.photo} size={48} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink group-hover:text-brand-strong">{p.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Flag flag={p.flag} country={p.countryName} className="text-sm" />
          <span className="truncate">{p.countryName}</span>
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="tabular block text-sm font-black text-ink">{p.rank ? `#${p.rank}` : "—"}</span>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{p.tour}</span>
      </span>
    </Link>
  );
}

function Grid({ players }: { players: PlayerListItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((p) => <PlayerCard key={p.slug} p={p} />)}
    </div>
  );
}

export function PlayersExplorer({ players }: { players: PlayerListItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalizeName(query.trim());
    return players
      .filter((p) => (filter === "all" ? true : filter === "PL" ? p.countryCode === "PL" : p.tour === filter))
      .filter((p) => !q || normalizeName(p.name).includes(q) || normalizeName(p.countryName).includes(q))
      .sort(byRank);
  }, [players, filter, query]);

  const sections = filter === "all" && !query.trim()
    ? [
        { title: "Polki i Polacy", list: filtered.filter((p) => p.countryCode === "PL") },
        { title: "WTA", list: filtered.filter((p) => p.tour === "WTA" && p.countryCode !== "PL") },
        { title: "ATP", list: filtered.filter((p) => p.tour === "ATP" && p.countryCode !== "PL") },
      ].filter((s) => s.list.length)
    : null;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>Wszyscy</Chip>
          <Chip active={filter === "PL"} onClick={() => setFilter("PL")} tone="brand">Polki i Polacy</Chip>
          <Chip active={filter === "WTA"} onClick={() => setFilter("WTA")}>WTA</Chip>
          <Chip active={filter === "ATP"} onClick={() => setFilter("ATP")}>ATP</Chip>
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">Szukaj zawodnika</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj po nazwisku lub kraju"
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-ink/40"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nie znaleziono zawodników" description="Zmień filtr albo zapytanie." />
      ) : sections ? (
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.title} aria-label={s.title}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-ink">{s.title}</h2>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">{s.list.length}</span>
              </div>
              <Grid players={s.list} />
            </section>
          ))}
        </div>
      ) : (
        <Grid players={filtered} />
      )}
    </div>
  );
}
