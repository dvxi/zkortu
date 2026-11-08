/**
 * Player profiles importer → Sanity `player` documents (/zawodnicy).
 *
 * Creates a profile for every player in the ATP/WTA top N (default 100) and
 * every ranked Polish player. Documents have deterministic ids
 * (`player-<apiKey>`) and are only ever created: names, photos, tags and facts
 * edited in the Studio are never overwritten, and players who drop out of the
 * top N keep their profile (and URL).
 *
 * Usage:
 *   npx tsx scripts/import-players.ts --dry-run
 *   npx tsx scripts/import-players.ts [--top=100]
 */

import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

// load .env.local when present (no dotenv dependency)
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* no .env.local */
}
import { fetchRankings } from "../lib/api-tennis";
import { slugify } from "../lib/format";
import type { Player } from "../lib/types";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);
const DRY = args["dry-run"] === "true";
const TOP = Number(args.top ?? 100);

/**
 * API-Tennis spells names without diacritics. Polish spellings for ranked Polish
 * players (only where certain; editors can fix the rest in the Studio).
 */
const POLISH_NAMES: Record<string, string> = {
  "Iga Swiatek": "Iga Świątek",
  "Maja Chwalinska": "Maja Chwalińska",
  "Magdalena Frech": "Magdalena Fręch",
  "Urszula Radwanska": "Urszula Radwańska",
  "Marcelina Podlinska": "Marcelina Podlińska",
  "Daria Gorska": "Daria Górska",
  "Malwina Rowinska": "Malwina Rowińska",
  "Magdalena Hedrzak": "Magdalena Hędrzak",
  "Linda Klimovicova": "Linda Klimovičová",
  "Maks Kasnikowski": "Maks Kaśnikowski",
  "Marcel Zielinski": "Marcel Zieliński",
  "Fryderyk Lechno-Wasiutynski": "Fryderyk Lechno-Wasiutyński",
  "Alan Wazny": "Alan Ważny",
  "Pawel Juszczak": "Paweł Juszczak",
  "Jan Chlodnicki": "Jan Chłodnicki",
  "Jakub Jedrzejczak": "Jakub Jędrzejczak",
};

/** API full names with scrambled order (verified 2026-11-08), keyed by API player key. */
const NAME_BY_KEY: Record<string, string> = {
  "1777": "Tomás Martín Etcheverry",
  "366": "Thiago Agustín Tirante",
  "388": "Juan Manuel Cerúndolo",
  "9596": "Román Andrés Burruchaga",
  "9217": "Adolfo Daniel Vallejo",
  "2227": "Coleman Wong",
  "796": "Bu Yunchaokete",
  "1151": "Elena-Gabriela Ruse",
};

interface Candidate {
  key: string;
  name: string;
  tour: "ATP" | "WTA";
  /** null for players competing as neutrals */
  countryCode: string | null;
  rank: number;
}

async function candidates(): Promise<Candidate[]> {
  const out: Candidate[] = [];
  for (const tour of ["WTA", "ATP"] as const) {
    const ranking: Player[] = await fetchRankings(tour);
    for (const p of ranking) {
      if (!p.playerKey) continue;
      if (p.rank > TOP && p.countryCode !== "PL") continue;
      out.push({ key: p.playerKey, name: NAME_BY_KEY[p.playerKey] ?? POLISH_NAMES[p.name] ?? p.name, tour, countryCode: p.countryCode, rank: p.rank });
    }
  }
  return out;
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "g3425kho";
  const token = process.env.SANITY_API_TOKEN;
  if (!DRY && !token) throw new Error("SANITY_API_TOKEN is required (or use --dry-run)");
  const client = createClient({ projectId, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production", apiVersion: "2024-01-01", token, useCdn: false });

  const list = await candidates();
  const existing = await client.fetch<Array<{ _id: string; apiPlayerKey?: string; slug?: string }>>(`*[_type == "player"]{ _id, apiPlayerKey, "slug": slug.current }`);
  const knownKeys = new Set(existing.map((d) => d.apiPlayerKey).filter(Boolean));
  const usedSlugs = new Set(existing.map((d) => d.slug).filter(Boolean));

  const toCreate = list.filter((c) => !knownKeys.has(c.key));
  console.log(`${list.length} candidates (top ${TOP} ATP/WTA + Polish players), ${existing.length} profiles exist, ${toCreate.length} to create`);

  const docs = toCreate.map((c) => {
    let slug = slugify(c.name);
    if (usedSlugs.has(slug)) slug = `${slug}-${c.tour.toLowerCase()}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${c.key}`;
    usedSlugs.add(slug);
    return {
      _id: `player-${c.key}`,
      _type: "player",
      name: c.name,
      slug: { _type: "slug", current: slug },
      tour: c.tour,
      ...(c.countryCode ? { countryCode: c.countryCode } : {}),
      apiPlayerKey: c.key,
      tag: c.name,
    };
  });

  for (const d of docs.slice(0, 15)) console.log(`  + ${d.tour} ${d.countryCode ?? "--"} ${d.name} → /zawodnicy/${d.slug.current}`);
  if (docs.length > 15) console.log(`  … and ${docs.length - 15} more`);
  if (DRY || docs.length === 0) return;

  // createIfNotExists keeps the run idempotent even if two runs overlap
  for (let i = 0; i < docs.length; i += 100) {
    const tx = client.transaction();
    for (const d of docs.slice(i, i + 100)) tx.createIfNotExists(d);
    await tx.commit({ visibility: "async" });
  }
  console.log(`created ${docs.length} profiles`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
