/**
 * API-Tennis client (api-tennis.p.rapidapi.com)
 * Adapt the raw response types here if the actual API shapes differ.
 */

import type { Player, LiveMatch, Tournament } from "./mock-data";

const BASE_URL = "https://api-tennis.p.rapidapi.com/tennis/";
const HOST = "api-tennis.p.rapidapi.com";

// ─── Country helpers ──────────────────────────────────────────────────────────

const COUNTRY_PL: Record<string, string> = {
  Italy: "Włochy", Spain: "Hiszpania", Germany: "Niemcy", Russia: "Rosja",
  Norway: "Norwegia", Denmark: "Dania", USA: "USA", "United States": "USA",
  Greece: "Grecja", Bulgaria: "Bułgaria", Poland: "Polska", France: "Francja",
  "United Kingdom": "Wielka Brytania", "Great Britain": "Wielka Brytania",
  Australia: "Australia", Serbia: "Serbia", Belarus: "Białoruś",
  "Czech Republic": "Czechy", Kazakhstan: "Kazachstan", China: "Chiny",
  Canada: "Kanada", Argentina: "Argentyna", Croatia: "Chorwacja",
  Switzerland: "Szwajcaria", Netherlands: "Holandia", Belgium: "Belgia",
  Romania: "Rumunia", Portugal: "Portugalia", Austria: "Austria",
  Brazil: "Brazylia", Ukraine: "Ukraina", Japan: "Japonia",
  "South Korea": "Korea Południowa", Slovakia: "Słowacja", Hungary: "Węgry",
};

const COUNTRY_FLAG: Record<string, string> = {
  IT: "🇮🇹", ES: "🇪🇸", DE: "🇩🇪", RU: "🇷🇺", NO: "🇳🇴", DK: "🇩🇰",
  US: "🇺🇸", GR: "🇬🇷", BG: "🇧🇬", PL: "🇵🇱", FR: "🇫🇷", GB: "🇬🇧",
  AU: "🇦🇺", RS: "🇷🇸", BY: "🇧🇾", CZ: "🇨🇿", KZ: "🇰🇿", CN: "🇨🇳",
  CA: "🇨🇦", AR: "🇦🇷", HR: "🇭🇷", CH: "🇨🇭", NL: "🇳🇱", BE: "🇧🇪",
  RO: "🇷🇴", PT: "🇵🇹", AT: "🇦🇹", BR: "🇧🇷", UA: "🇺🇦", JP: "🇯🇵",
  KR: "🇰🇷", SK: "🇸🇰", HU: "🇭🇺", CL: "🇨🇱", CO: "🇨🇴", MX: "🇲🇽",
  IN: "🇮🇳", TW: "🇹🇼",
};

function plCountry(name: string) {
  return COUNTRY_PL[name] ?? name;
}
function flagFromCode(code: string) {
  return COUNTRY_FLAG[code?.toUpperCase()] ?? "🏳️";
}
function flagFromName(name: string) {
  const entry = Object.entries(COUNTRY_PL).find(([, pl]) => pl === name || pl === name);
  const code = entry
    ? Object.entries(COUNTRY_FLAG).find(() => true)?.[0] ?? ""
    : "";
  return COUNTRY_FLAG[code] ?? "🏳️";
}

// ─── Surface mapping ──────────────────────────────────────────────────────────

function toSurface(s: string): LiveMatch["surface"] {
  if (!s) return "Hard";
  const lower = s.toLowerCase();
  if (lower.includes("clay")) return "Clay";
  if (lower.includes("grass")) return "Grass";
  return "Hard";
}

function toTournamentSurface(s: string): Tournament["surface"] {
  if (!s) return "Hard";
  const lower = s.toLowerCase();
  if (lower.includes("clay")) return "Clay";
  if (lower.includes("grass")) return "Grass";
  if (lower.includes("indoor") || lower.includes("carpet")) return "Indoor Hard";
  return "Hard";
}

// ─── Round translation ────────────────────────────────────────────────────────

function toRound(r: string): string {
  const map: Record<string, string> = {
    "Final": "Finał",
    "Semi-Final": "Półfinał",
    "Semi-Finals": "Półfinał",
    "Quarter-Final": "Ćwierćfinał",
    "Quarter-Finals": "Ćwierćfinał",
    "Round of 16": "1/8 finału",
    "Round of 32": "1/16 finału",
    "Round of 64": "1/32 finału",
    "Round of 128": "1/64 finału",
    "1st Round": "1. runda",
    "2nd Round": "2. runda",
    "3rd Round": "3. runda",
    "4th Round": "4. runda",
  };
  return map[r] ?? r;
}

// ─── Category detection ───────────────────────────────────────────────────────

function toCategory(name: string): Tournament["category"] {
  const n = name.toLowerCase();
  if (n.includes("grand slam") || ["australian open", "roland garros", "wimbledon", "us open"].some(gs => n.includes(gs))) return "Grand Slam";
  if (n.includes("atp 1000") || n.includes("masters 1000") || ["indian wells", "miami", "monte carlo", "madrid", "rome", "canadian", "cincinnati", "shanghai", "paris masters"].some(t => n.includes(t))) return "ATP 1000";
  if (n.includes("atp 500")) return "ATP 500";
  if (n.includes("wta 1000")) return "WTA 1000";
  if (n.includes("wta 500")) return "WTA 500";
  if (n.includes("wta 250")) return "WTA 250";
  if (n.includes("atp") || n.includes("atp 250")) return "ATP 250";
  return "ATP 250";
}

// ─── Raw API types ────────────────────────────────────────────────────────────

interface RawRankingPlayer {
  rank: string;
  points: string;
  player_name: string;
  player_key: string;
  country: string;
  country_code: string;
  moving?: string;
  team_logo?: string;
}

interface RawScore {
  home?: Record<string, string>;
  away?: Record<string, string>;
}

interface RawMatch {
  event_key: string;
  event_date: string;
  event_time: string;
  event_home_team: string;
  event_away_team: string;
  home_team_key?: string;
  away_team_key?: string;
  event_final_result: string;
  event_status: string;
  country_name: string;
  league_name: string;
  league_key?: string;
  league_round?: string;
  event_home_team_country?: string;
  event_away_team_country?: string;
  home_country_code?: string;
  away_country_code?: string;
  scores?: RawScore;
  statistics?: Array<{ type: string; home: string; away: string }>;
  surface?: string;
}

interface RawTournament {
  league_key: string;
  league_name: string;
  country_name: string;
  country_logo?: string;
  league_logo?: string;
  league_season?: string;
  league_start?: string;
  league_end?: string;
  surface?: string;
}

interface ApiResponse<T> {
  result: T[];
  success: number;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function apiFetch<T>(params: Record<string, string>, revalidate: number): Promise<T[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY not set");

  const url = BASE_URL + "?" + new URLSearchParams(params).toString();
  const res = await fetch(url, {
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": HOST,
    },
    next: { revalidate },
  });

  if (!res.ok) throw new Error(`API-Tennis error ${res.status}`);
  const data: ApiResponse<T> = await res.json();
  if (!data.result || !Array.isArray(data.result)) throw new Error("Unexpected API shape");
  return data.result;
}

// ─── Rankings ─────────────────────────────────────────────────────────────────

export async function fetchRankings(type: "ATP" | "WTA"): Promise<Player[]> {
  const raw = await apiFetch<RawRankingPlayer>(
    { method: "get_ranking", ranking_type: type },
    3600,
  );

  return raw.slice(0, 20).map((p, i) => {
    const moving = parseInt(p.moving ?? "0", 10);
    return {
      rank: parseInt(p.rank, 10) || i + 1,
      name: p.player_name,
      country: plCountry(p.country),
      flag: flagFromCode(p.country_code),
      points: parseInt(p.points, 10) || 0,
      pointsDiff: moving,
      age: 0,
      bestRank: parseInt(p.rank, 10) || i + 1,
    };
  });
}

// ─── Live scores ──────────────────────────────────────────────────────────────

function parseSets(scores: RawScore | undefined): Array<{ p1: number; p2: number }> {
  if (!scores?.home || !scores?.away) return [];
  const sets: Array<{ p1: number; p2: number }> = [];
  const setCount = Math.max(
    Object.keys(scores.home).filter(k => k !== "current").length,
    Object.keys(scores.away).filter(k => k !== "current").length,
  );
  for (let i = 1; i <= setCount; i++) {
    const p1 = parseInt(scores.home[String(i)] ?? "0", 10);
    const p2 = parseInt(scores.away[String(i)] ?? "0", 10);
    sets.push({ p1, p2 });
  }
  return sets;
}

function parseStatus(raw: RawMatch): LiveMatch["status"] {
  const s = raw.event_status?.toLowerCase() ?? "";
  if (s === "finished" || s === "fin" || raw.event_final_result !== "-") return "finished";
  if (s === "not started" || s === "" || s === "ns") return "upcoming";
  return "live";
}

function statValue(stats: RawMatch["statistics"], type: string, side: "home" | "away"): number {
  const entry = stats?.find(s => s.type.toLowerCase().includes(type.toLowerCase()));
  const raw = entry?.[side] ?? "0";
  return parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0;
}

export async function fetchLiveScores(): Promise<LiveMatch[]> {
  const raw = await apiFetch<RawMatch>({ method: "get_livescore" }, 60);

  return raw.slice(0, 20).map((m, i) => ({
    id: m.event_key || `m${i}`,
    tournament: m.league_name,
    surface: toSurface(m.surface ?? ""),
    round: toRound(m.league_round ?? ""),
    player1: m.event_home_team,
    player2: m.event_away_team,
    flag1: flagFromCode(m.home_country_code ?? ""),
    flag2: flagFromCode(m.away_country_code ?? ""),
    sets: parseSets(m.scores),
    currentGame: m.scores?.home?.["current"] ?? "",
    server: 1 as const,
    status: parseStatus(m),
    startTime: m.event_time ?? "",
    stats: {
      aces: [statValue(m.statistics, "ace", "home"), statValue(m.statistics, "ace", "away")],
      doubleFaults: [statValue(m.statistics, "double fault", "home"), statValue(m.statistics, "double fault", "away")],
      firstServe: [statValue(m.statistics, "first serve", "home"), statValue(m.statistics, "first serve", "away")],
      winners: [statValue(m.statistics, "winner", "home"), statValue(m.statistics, "winner", "away")],
      errors: [statValue(m.statistics, "unforced", "home"), statValue(m.statistics, "unforced", "away")],
      breakPoints: [statValue(m.statistics, "break point", "home"), statValue(m.statistics, "break point", "away")],
    },
  }));
}

// ─── Calendar / tournaments ───────────────────────────────────────────────────

export async function fetchTournaments(): Promise<Tournament[]> {
  const raw = await apiFetch<RawTournament>({ method: "get_tournaments" }, 3600);

  const now = new Date().toISOString().slice(0, 10);

  return raw.slice(0, 12).map((t, i) => {
    const start = t.league_start ?? now;
    const end = t.league_end ?? now;
    let status: Tournament["status"] = "upcoming";
    if (end < now) status = "completed";
    else if (start <= now) status = "live";

    return {
      id: t.league_key || `t${i}`,
      name: t.league_name,
      location: t.country_name,
      country: t.country_name,
      flag: "🏆",
      surface: toTournamentSurface(t.surface ?? ""),
      category: toCategory(t.league_name),
      startDate: start,
      endDate: end,
      prize: "",
      status,
      imageQuery: `tennis tournament ${t.country_name}`,
    };
  });
}

// Re-export the void so tree-shaking doesn't complain about the flag helper
void flagFromName;
