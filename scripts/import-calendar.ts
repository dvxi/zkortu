/**
 * Season calendar importer → Sanity `tournament` documents.
 *
 * Sources (no API key needed):
 *   - WTA: official site JSON  https://api.wtatennis.com/tennis/tournaments/
 *   - ATP: ESPN tennis scoreboard (undocumented, public) site.api.espn.com
 * Enrichment: API-Tennis tournament index → `apiTournamentKey` + surface.
 *
 * Usage:
 *   npx tsx scripts/import-calendar.ts --year=2026 --dry-run
 *   node --env-file=.env.local $(npm bin)/tsx scripts/import-calendar.ts --year=2026
 * Options: --tour=atp|wta|all (default all), --dry-run (print only),
 *          --update-dates (also overwrite dates of existing documents), --force (overwrite all editor fields)
 *
 * Existing documents are matched by tour + date proximity + name tokens and only
 * data fields (dates, prize, country, apiTournamentKey, missing surface) are patched;
 * images, descriptions and winners entered by editors are never touched.
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
import { fetchFixtures, fetchTournamentIndex, matchTournamentInIndex, type RawTournament } from "../lib/api-tennis";
import { countryFromCode, normalizeName } from "../lib/countries";
import { slugify } from "../lib/format";
import type { Surface, TournamentCategory } from "../lib/types";

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);
const YEAR = Number(args.year ?? new Date().getFullYear());
const DRY = args["dry-run"] === "true";
const FORCE = args.force === "true";
const UPDATE_DATES = args["update-dates"] === "true" || FORCE;
const TOUR = (args.tour ?? "all") as "atp" | "wta" | "all";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ISO3: Record<string, string> = {
  AUS: "AU", NZL: "NZ", HKG: "HK", CHN: "CN", JPN: "JP", KOR: "KR", TWN: "TW", IND: "IN", THA: "TH", SGP: "SG", KAZ: "KZ", UZB: "UZ",
  QAT: "QA", ARE: "AE", SAU: "SA", TUR: "TR", ISR: "IL", EGY: "EG", MAR: "MA", TUN: "TN", ZAF: "ZA", RSA: "ZA", USA: "US", CAN: "CA",
  MEX: "MX", BRA: "BR", ARG: "AR", CHL: "CL", COL: "CO", ECU: "EC", PER: "PE", URY: "UY", URU: "UY", GBR: "GB", IRL: "IE", FRA: "FR",
  ESP: "ES", PRT: "PT", POR: "PT", ITA: "IT", DEU: "DE", GER: "DE", AUT: "AT", CHE: "CH", SUI: "CH", NLD: "NL", NED: "NL", BEL: "BE",
  LUX: "LU", DNK: "DK", DEN: "DK", SWE: "SE", NOR: "NO", FIN: "FI", POL: "PL", CZE: "CZ", SVK: "SK", HUN: "HU", ROU: "RO", ROM: "RO",
  BGR: "BG", BUL: "BG", SRB: "RS", HRV: "HR", CRO: "HR", SVN: "SI", SLO: "SI", BIH: "BA", MNE: "ME", MKD: "MK", GRC: "GR", GRE: "GR",
  CYP: "CY", MLT: "MT", EST: "EE", LVA: "LV", LAT: "LV", LTU: "LT", UKR: "UA", RUS: "RU", BLR: "BY", GEO: "GE", ARM: "AM", AZE: "AZ",
  MDA: "MD", MCO: "MC", MON: "MC", AND: "AD", LIE: "LI", ISL: "IS", MAC: "MO", PHL: "PH", IDN: "ID", MYS: "MY", VNM: "VN", DOM: "DO",
  GTM: "GT", CRI: "CR", PAN: "PA", BOL: "BO", PRY: "PY", VEN: "VE", NGA: "NG", KEN: "KE", GHA: "GH", BHR: "BH", KWT: "KW", OMN: "OM",
  JOR: "JO", LBN: "LB", PAK: "PK", LKA: "LK", BGD: "BD", NPL: "NP", MNG: "MN",
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "united states": "US", usa: "US", australia: "AU", "new zealand": "NZ", china: "CN", "hong kong": "HK", japan: "JP", "south korea": "KR",
  india: "IN", qatar: "QA", "united arab emirates": "AE", "saudi arabia": "SA", turkey: "TR", "türkiye": "TR", canada: "CA", mexico: "MX",
  brazil: "BR", argentina: "AR", chile: "CL", colombia: "CO", "great britain": "GB", "united kingdom": "GB", england: "GB", france: "FR",
  spain: "ES", portugal: "PT", italy: "IT", germany: "DE", austria: "AT", switzerland: "CH", netherlands: "NL", belgium: "BE",
  sweden: "SE", norway: "NO", denmark: "DK", finland: "FI", poland: "PL", "czech republic": "CZ", czechia: "CZ", croatia: "HR",
  serbia: "RS", greece: "GR", hungary: "HU", romania: "RO", bulgaria: "BG", morocco: "MA", monaco: "MC", kazakhstan: "KZ", uzbekistan: "UZ",
  "china pr": "CN", "pr china": "CN", "chinese taipei": "TW", taiwan: "TW", "hong kong china": "HK", "korea republic": "KR", korea: "KR",
  "russian federation": "RU", russia: "RU", ukraine: "UA", estonia: "EE", latvia: "LV", lithuania: "LT", slovakia: "SK", slovenia: "SI",
  luxembourg: "LU", ireland: "IE", scotland: "GB", wales: "GB", israel: "IL", egypt: "EG", tunisia: "TN", "south africa": "ZA",
  ecuador: "EC", peru: "PE", uruguay: "UY", "dominican republic": "DO", thailand: "TH", singapore: "SG", malaysia: "MY", indonesia: "ID",
  vietnam: "VN", philippines: "PH", bahrain: "BH", kuwait: "KW", oman: "OM", jordan: "JO", georgia: "GE", armenia: "AM", azerbaijan: "AZ",
};

/** Events ESPN lists without a venue. */
const VENUE_FALLBACK: Array<{ test: RegExp; city: string; code: string }> = [
  { test: /nitto atp finals/i, city: "Turyn", code: "IT" },
  { test: /next gen atp finals/i, city: "Jeddah", code: "SA" },
];

function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((w) => (w.trim() && !/^(de|di|del|la|le|of|the|and|y)$/.test(w) ? w[0].toUpperCase() + w.slice(1) : w))
    .join("");
}

function wtaSurface(surface: string, inOut: string): Surface {
  const s = surface.toLowerCase();
  if (s.includes("clay")) return "Clay";
  if (s.includes("grass")) return "Grass";
  if (inOut === "I" || s.includes("carpet")) return "Indoor Hard";
  return "Hard";
}

function formatPrize(amount: number | null | undefined, currency: string | null | undefined): string | undefined {
  if (!amount) return undefined;
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "AUD" ? "A$" : (currency ?? "");
  return `${sym}${amount.toLocaleString("pl-PL").replace(/ /g, " ")}`;
}

// ATP levels are not exposed by ESPN; the 2026 structure is stable enough for a keyword map.
const ATP_1000 = /indian wells|bnp paribas open|miami open|monte[- ]carlo|madrid open|internazionali|rome|national bank open|canadian open|cincinnati|shanghai|paris masters|rolex paris/i;
const ATP_500 = /rotterdam|abn amro|dallas open|qatar|doha|rio open|dubai duty free|acapulco|abierto mexicano|barcelona open|bmw open|munich|hamburg open|halle|terra wortmann|queen'?s|hsbc championships|dc open|washington|china open|beijing|japan open|tokyo|erste bank|vienna|swiss indoors|basel/i;
const GRAND_SLAM = /australian open|roland garros|french open|wimbledon|us open/i;
const FINALS = /atp finals|next gen/i;
const TEAM_EVENTS = /davis cup|united cup|laver cup|hopman|billie jean king|olympic/i;

function atpCategory(name: string): TournamentCategory {
  if (GRAND_SLAM.test(name)) return "Grand Slam";
  if (FINALS.test(name)) return "ATP Finals";
  if (TEAM_EVENTS.test(name)) return "Inne";
  if (ATP_1000.test(name)) return "ATP 1000";
  if (ATP_500.test(name)) return "ATP 500";
  return "ATP 250";
}

function wtaCategory(level: string, name: string): TournamentCategory | null {
  if (/grand slam/i.test(level) || GRAND_SLAM.test(name)) return "Grand Slam";
  if (/finals/i.test(level) || /wta finals/i.test(name)) return "WTA Finals";
  if (/1000/.test(level)) return "WTA 1000";
  if (/500/.test(level)) return "WTA 500";
  if (/250/.test(level)) return "WTA 250";
  if (TEAM_EVENTS.test(name)) return "Inne";
  return null; // ITF / WTA 125 are not part of the public calendar
}

/** Strip sponsor prefixes/suffixes to a readable name: "Erste Bank Open" stays, "Miami Open presented by Itau" → "Miami Open". */
function cleanName(name: string): string {
  return name
    .replace(/\s+(presented|presentado|powered)\s+(by|por)\s+.*$/i, "")
    .replace(/\s+by\s+[A-Z][\w+&.-]*(\s+[A-Z][\w+&.-]*)?$/u, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ─── Source: WTA ─────────────────────────────────────────────────────────────

interface WtaEntry {
  tournamentGroup?: { id: number; name: string; level: string };
  level?: string;
  title: string;
  startDate: string;
  endDate: string;
  surface: string;
  inOutdoor: string;
  city: string;
  country: string;
  prizeMoney?: number | null;
  prizeMoneyCurrency?: string | null;
  winners?: Array<{ singles?: { players?: Array<{ fullName?: string }> } ; year?: number }>;
}

interface Draft {
  tour: "ATP" | "WTA" | "GS";
  name: string;
  location: string;
  countryCode: string | null;
  country: string;
  surface: Surface | null;
  category: TournamentCategory;
  startDate: string;
  endDate: string;
  prize?: string;
  source: string;
  /** cross-check source only: never creates a new tournament */
  fillOnly?: boolean;
  rawVenue?: string;
}

async function fetchWta(year: number): Promise<Draft[]> {
  const out: Draft[] = [];
  for (let page = 0; page < 10; page++) {
    const url = `https://api.wtatennis.com/tennis/tournaments/?page=${page}&pageSize=100&excludeLevels=ITF&from=${year}-01-01&to=${year}-12-31`;
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!res.ok) throw new Error(`WTA HTTP ${res.status}`);
    const data = (await res.json()) as { pageInfo?: { numPages?: number }; content?: WtaEntry[] };
    for (const e of data.content ?? []) {
      const level = e.level || e.tournamentGroup?.level || "";
      const name = cleanName(e.title.split(" - ")[0]);
      const category = wtaCategory(level, name);
      if (!category) continue;
      const code = ISO3[e.country] ?? null;
      out.push({
        tour: category === "Grand Slam" ? "GS" : "WTA",
        name,
        location: titleCase(e.city),
        countryCode: code,
        country: code ? countryFromCode(code).namePl : e.country,
        surface: wtaSurface(e.surface, e.inOutdoor),
        category,
        startDate: e.startDate,
        endDate: e.endDate,
        prize: formatPrize(e.prizeMoney, e.prizeMoneyCurrency),
        source: "wtatennis.com",
      });
    }
    if ((data.content?.length ?? 0) < 100) break;
  }
  return out;
}

// ─── Source: ESPN (ATP) ───────────────────────────────────────────────────────

interface EspnEvent {
  name: string;
  shortName?: string;
  date: string;
  endDate?: string;
  venue?: { displayName?: string; fullName?: string };
}

async function fetchEspn(league: "atp" | "wta", year: number): Promise<Draft[]> {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/tennis/${league}/scoreboard?dates=${year}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`ESPN HTTP ${res.status}`);
  const data = (await res.json()) as { events?: EspnEvent[] };
  const out: Draft[] = [];
  for (const e of data.events ?? []) {
    const name = cleanName(e.name);
    const venue = e.venue?.displayName ?? e.venue?.fullName ?? "";
    const parts = venue.split(",").map((s) => s.trim()).filter(Boolean);
    const fallback = VENUE_FALLBACK.find((f) => f.test.test(name));
    const city = parts[0] ?? fallback?.city ?? "";
    const countryName = parts[parts.length - 1] ?? "";
    const code = (parts.length > 1 ? COUNTRY_NAME_TO_CODE[normalizeName(countryName)] : undefined) ?? fallback?.code ?? null;
    const category = league === "atp" ? atpCategory(name) : (wtaCategory("", name) ?? "Inne");
    out.push({
      tour: category === "Grand Slam" ? "GS" : league === "atp" ? "ATP" : "WTA",
      name,
      location: city,
      countryCode: code,
      country: code ? countryFromCode(code).namePl : countryName,
      surface: null,
      category,
      startDate: e.date.slice(0, 10),
      // ESPN end dates are the day after the final at 04:59Z
      endDate: e.endDate ? new Date(new Date(e.endDate).getTime() - 12 * 3600 * 1000).toISOString().slice(0, 10) : e.date.slice(0, 10),
      source: "espn.com",
      fillOnly: league === "wta",
      rawVenue: venue,
    });
  }
  return out;
}

// ─── Merge + enrich ──────────────────────────────────────────────────────────

const GENERIC = new Set(["open", "international", "internationaux", "championships", "championship", "masters", "classic", "cup", "tennis", "grand", "prix", "trophy", "ladies", "women", "mens", "presented", "rolex", "bank", "group", "tour", "finals"]);

function keyTokens(d: Draft): string[] {
  return normalizeName(`${d.name} ${d.location}`)
    .split(" ")
    .filter((t) => t.length > 3 && !GENERIC.has(t));
}

function sameEvent(a: Draft, b: Draft): boolean {
  if (a.tour !== b.tour) return false;
  const days = Math.abs(new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) / 86_400_000;
  if (days > 10) return false;
  const ta = new Set(keyTokens(a));
  return keyTokens(b).some((t) => ta.has(t));
}

function mergeDrafts(lists: Draft[][]): Draft[] {
  const merged: Draft[] = [];
  for (const list of lists) {
    for (const d of list) {
      const existing = merged.find((m) => sameEvent(m, d));
      if (!existing) {
        if (!d.fillOnly) merged.push({ ...d });
        continue;
      }
      // prefer official WTA fields, fill gaps from ESPN
      existing.surface ??= d.surface;
      existing.prize ??= d.prize;
      existing.countryCode ??= d.countryCode;
      if (!existing.country) existing.country = d.country;
      if (existing.source === "espn.com" && d.source !== "espn.com") Object.assign(existing, { ...d, surface: d.surface ?? existing.surface, prize: d.prize ?? existing.prize });
    }
  }
  return merged.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

async function enrichFromApiTennis(drafts: Draft[]): Promise<Array<Draft & { apiTournamentKey: string | null }>> {
  let index: RawTournament[] = [];
  try {
    index = await fetchTournamentIndex();
  } catch (err) {
    console.warn("API-Tennis index unavailable, skipping key/surface enrichment:", (err as Error).message);
  }
  const today = new Date().toISOString().slice(0, 10);
  const out: Array<Draft & { apiTournamentKey: string | null }> = [];
  for (const d of drafts) {
    if (!index.length) {
      out.push({ ...d, apiTournamentKey: null });
      continue;
    }
    const candidates = matchTournamentInIndex({ name: d.name, location: d.location, category: d.category, surface: d.surface ?? "Hard" }, index);
    // group main draw + qualification per tour, best first
    const groups: string[][] = [];
    const seen = new Set<string>();
    for (const c of candidates) {
      const base = `${c.eventType.split(" ")[0]}|${c.name.replace(/\s*-\s*qualif\w*$/i, "").trim().toLowerCase()}`;
      if (seen.has(base)) {
        groups[groups.length - 1].push(c.key);
        continue;
      }
      seen.add(base);
      groups.push([c.key]);
    }
    let keys: string[] = [];
    if (d.startDate <= today && hasApiKey()) {
      // the tournament has started: keep only keys that actually have fixtures in the window
      const perTour = new Map<string, string[]>();
      for (const g of groups) {
        const tour = candidates.find((c) => c.key === g[0])?.eventType.split(" ")[0] ?? "";
        if (perTour.has(tour)) continue;
        try {
          const found = await fetchFixtures({ dateStart: d.startDate, dateStop: d.endDate, tournamentKey: g[0] }, "all");
          if (found.length > 0) perTour.set(tour, g);
        } catch {
          /* fall through to best-score keys */
        }
      }
      keys = Array.from(perTour.values()).flat();
    }
    if (keys.length === 0) {
      // not started yet or nothing verified: best-scoring group per tour
      const perTour = new Map<string, string[]>();
      for (const g of groups) {
        const tour = candidates.find((c) => c.key === g[0])?.eventType.split(" ")[0] ?? "";
        if (!perTour.has(tour)) perTour.set(tour, g);
      }
      keys = Array.from(perTour.values()).flat();
    }
    const surfaceFromApi = index.find((t) => keys.includes(String(t.tournament_key)) && t.tournament_sourface)?.tournament_sourface;
    const surface = d.surface ?? (surfaceFromApi ? ((/clay/i.test(surfaceFromApi) ? "Clay" : /grass/i.test(surfaceFromApi) ? "Grass" : /indoor|carpet/i.test(surfaceFromApi) ? "Indoor Hard" : "Hard") as Surface) : null);
    out.push({ ...d, surface, apiTournamentKey: keys.length ? Array.from(new Set(keys)).join(",") : null });
  }
  return out;
}

function hasApiKey(): boolean {
  const k = process.env.API_TENNIS_KEY || process.env.RAPIDAPI_KEY;
  return Boolean(k && k !== "[SENSITIVE]");
}

// ─── Sanity upsert ───────────────────────────────────────────────────────────

interface ExistingDoc {
  _id: string;
  name: string;
  location: string;
  category: string;
  startDate: string;
  surface?: string;
  image?: unknown;
  description?: string;
  apiTournamentKey?: string;
}

function tourOf(category: string): "ATP" | "WTA" | "GS" {
  if (category === "Grand Slam") return "GS";
  return category.startsWith("WTA") ? "WTA" : "ATP";
}

async function main() {
  console.log(`Importing ${YEAR} calendar (tour=${TOUR}, ${DRY ? "dry run" : "write"})`);
  const lists: Draft[][] = [];
  if (TOUR !== "atp") lists.push(await fetchWta(YEAR));
  if (TOUR !== "wta") lists.push(await fetchEspn("atp", YEAR));
  if (TOUR !== "atp") lists.push(await fetchEspn("wta", YEAR));
  const drafts = await enrichFromApiTennis(mergeDrafts(lists));

  console.log(`${drafts.length} tournaments after merge\n`);
  for (const d of drafts) {
    console.log(
      `${d.startDate} – ${d.endDate}  ${d.category.padEnd(10)} ${d.name.padEnd(44)} ${(d.location + (d.countryCode ? ` (${d.countryCode})` : d.rawVenue ? ` [${d.rawVenue}]` : "")).padEnd(30)} ${(d.surface ?? "?").padEnd(11)} ${(d.prize ?? "").padEnd(14)} key=${d.apiTournamentKey ?? "-"}  [${d.source}]`,
    );
  }
  if (DRY) return;

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_TOKEN;
  if (!projectId || !token || token === "[SENSITIVE]") throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN are required to write");
  const client = createClient({ projectId, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production", apiVersion: "2024-01-01", token, useCdn: false });

  const existing = await client.fetch<ExistingDoc[]>(`*[_type == "tournament"]{ _id, name, location, category, startDate, surface, image, description, apiTournamentKey }`);
  let created = 0;
  let patched = 0;
  for (const d of drafts) {
    const match = existing.find((e) => {
      if (tourOf(e.category) !== d.tour) return false;
      const days = Math.abs(new Date(e.startDate).getTime() - new Date(d.startDate).getTime()) / 86_400_000;
      if (days > 10) return false;
      const te = new Set(normalizeName(`${e.name} ${e.location}`).split(" ").filter((t) => t.length > 3 && !GENERIC.has(t)));
      return keyTokens(d).some((t) => te.has(t));
    });
    const dates = { startDate: d.startDate, endDate: d.endDate };
    const data = {
      ...(d.prize ? { prize: d.prize } : {}),
      ...(d.countryCode ? { countryCode: d.countryCode, country: d.country } : {}),
      ...(d.apiTournamentKey ? { apiTournamentKey: d.apiTournamentKey } : {}),
    };
    if (match) {
      const patch = client.patch(match._id).set(data);
      if (UPDATE_DATES || !match.startDate) patch.set(dates);
      if (!match.surface && d.surface) patch.set({ surface: d.surface });
      if (FORCE) patch.set({ name: d.name, location: d.location, category: d.category, ...(d.surface ? { surface: d.surface } : {}) });
      await patch.commit();
      patched++;
    } else {
      await client.create({
        _id: `tour-${d.tour.toLowerCase()}-${slugify(d.name)}-${YEAR}`,
        _type: "tournament",
        name: d.name,
        location: d.location,
        country: d.country,
        surface: d.surface ?? "Hard",
        category: d.category,
        ...dates,
        ...data,
      });
      created++;
    }
  }
  console.log(`\nDone: ${created} created, ${patched} updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
