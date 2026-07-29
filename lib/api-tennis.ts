/**
 * API-Tennis client (api.api-tennis.com)
 * Auth: APIkey query param. Docs: https://api-tennis.com/documentation
 */

import type { Player, LiveMatch, Tournament } from "./mock-data";

const BASE_URL = "https://api.api-tennis.com/tennis/";

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
  Sweden: "Szwecja", Finland: "Finlandia",
};

const FLAG_BY_COUNTRY: Record<string, string> = {
  Italy: "🇮🇹", Spain: "🇪🇸", Germany: "🇩🇪", Russia: "🇷🇺", Norway: "🇳🇴",
  Denmark: "🇩🇰", USA: "🇺🇸", "United States": "🇺🇸", Greece: "🇬🇷",
  Bulgaria: "🇧🇬", Poland: "🇵🇱", France: "🇫🇷", "United Kingdom": "🇬🇧",
  "Great Britain": "🇬🇧", Australia: "🇦🇺", Serbia: "🇷🇸", Belarus: "🇧🇾",
  "Czech Republic": "🇨🇿", Kazakhstan: "🇰🇿", China: "🇨🇳", Canada: "🇨🇦",
  Argentina: "🇦🇷", Croatia: "🇭🇷", Switzerland: "🇨🇭", Netherlands: "🇳🇱",
  Belgium: "🇧🇪", Romania: "🇷🇴", Portugal: "🇵🇹", Austria: "🇦🇹",
  Brazil: "🇧🇷", Ukraine: "🇺🇦", Japan: "🇯🇵", "South Korea": "🇰🇷",
  Slovakia: "🇸🇰", Hungary: "🇭🇺", Chile: "🇨🇱", Colombia: "🇨🇴",
  Mexico: "🇲🇽", India: "🇮🇳", Taiwan: "🇹🇼", Sweden: "🇸🇪", Finland: "🇫🇮",
  Tunisia: "🇹🇳", Morocco: "🇲🇦", "South Africa": "🇿🇦",
};

function plCountry(name: string) {
  return COUNTRY_PL[name] ?? name;
}
function flagFromName(name: string) {
  return FLAG_BY_COUNTRY[name] ?? "🏳️";
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
    "Final": "Finał", "Semi-Final": "Półfinał", "Semi-Finals": "Półfinał",
    "Quarter-Final": "Ćwierćfinał", "Quarter-Finals": "Ćwierćfinał",
    "Round of 16": "1/8 finału", "Round of 32": "1/16 finału",
    "Round of 64": "1/32 finału", "Round of 128": "1/64 finału",
    "1st Round": "1. runda", "2nd Round": "2. runda",
    "3rd Round": "3. runda", "4th Round": "4. runda",
  };
  return map[r] ?? r;
}

// ─── Category detection ───────────────────────────────────────────────────────

function toCategory(name: string): Tournament["category"] {
  const n = name.toLowerCase();
  if (["australian open", "roland garros", "wimbledon", "us open"].some(gs => n.includes(gs))) return "Grand Slam";
  if (n.includes("atp 1000") || n.includes("masters 1000") || ["indian wells", "miami", "monte carlo", "madrid", "rome", "canadian", "cincinnati", "shanghai", "paris masters"].some(t => n.includes(t))) return "ATP 1000";
  if (n.includes("atp 500")) return "ATP 500";
  if (n.includes("wta 1000")) return "WTA 1000";
  if (n.includes("wta 500")) return "WTA 500";
  if (n.includes("wta 250")) return "WTA 250";
  return "ATP 250";
}

// ─── Raw API types ────────────────────────────────────────────────────────────

interface RawStandingsPlayer {
  place: string;
  player: string;
  player_key: string;
  league: string;
  movement: string; // "same" | "up" | "down"
  country: string;
  points: string;
}

interface RawScoreEntry {
  score_first?: string;
  score_second?: string;
  score_set?: string;
}

interface RawStatEntry {
  type: string;
  home: string;
  away: string;
}

interface RawMatch {
  event_key: string;
  event_date: string;
  event_time: string;
  event_first_player: string;
  event_second_player: string;
  first_player_key?: string;
  second_player_key?: string;
  event_final_result: string;
  event_game_result?: string;
  event_serve?: string;
  event_winner?: string;
  event_status: string;
  event_live?: string;
  tournament_name: string;
  tournament_key?: string;
  tournament_round?: string;
  scores?: RawScoreEntry[];
  statistics?: RawStatEntry[];
  surface?: string;
}

interface RawTournament {
  tournament_key: string;
  tournament_name: string;
  event_type_key?: string;
  event_type_type?: string;
  country_name?: string;
  surface?: string;
  start_date?: string;
  end_date?: string;
}

interface ApiResponse<T> {
  result: T[];
  success: number;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function apiFetch<T>(params: Record<string, string>, revalidate: number): Promise<T[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY not set");

  const url = BASE_URL + "?" + new URLSearchParams({ ...params, APIkey: key }).toString();
  const res = await fetch(url, { next: { revalidate } });

  if (!res.ok) throw new Error(`API-Tennis error ${res.status}`);
  const data: ApiResponse<T> = await res.json();
  if (!data.result || !Array.isArray(data.result)) throw new Error("Unexpected API shape");
  return data.result;
}

// ─── Rankings ─────────────────────────────────────────────────────────────────

export async function fetchRankings(type: "ATP" | "WTA"): Promise<Player[]> {
  const raw = await apiFetch<RawStandingsPlayer>(
    { method: "get_standings", event_type: type },
    3600,
  );

  return raw.slice(0, 20).map((p, i) => {
    const rank = parseInt(p.place, 10) || i + 1;
    const pointsDiff = p.movement === "up" ? 1 : p.movement === "down" ? -1 : 0;
    return {
      rank,
      name: p.player,
      country: plCountry(p.country),
      flag: flagFromName(p.country),
      points: parseInt(p.points, 10) || 0,
      pointsDiff,
      age: 0,
      bestRank: rank,
    };
  });
}

// ─── Live scores ──────────────────────────────────────────────────────────────

function parseSets(scores: RawScoreEntry[] | undefined): Array<{ p1: number; p2: number }> {
  if (!scores?.length) return [];
  return scores.map(s => ({
    p1: parseInt(s.score_first ?? "0", 10),
    p2: parseInt(s.score_second ?? "0", 10),
  }));
}

function parseStatus(m: RawMatch): LiveMatch["status"] {
  if (m.event_live === "1") return "live";
  if (m.event_final_result && m.event_final_result !== "-") return "finished";
  const s = m.event_status?.toLowerCase() ?? "";
  if (s === "finished" || s === "fin") return "finished";
  if (s === "not started" || s === "" || s === "ns") return "upcoming";
  return "live";
}

function statValue(stats: RawStatEntry[] | undefined, type: string, side: "home" | "away"): number {
  const entry = stats?.find(s => s.type.toLowerCase().includes(type.toLowerCase()));
  const raw = entry?.[side] ?? "0";
  return parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0;
}

export async function fetchLiveScores(): Promise<LiveMatch[]> {
  const raw = await apiFetch<RawMatch>({ method: "get_livescore" }, 60);

  return raw.slice(0, 20).map((m, i) => ({
    id: m.event_key || `m${i}`,
    tournament: m.tournament_name,
    surface: toSurface(m.surface ?? ""),
    round: toRound(m.tournament_round ?? ""),
    player1: m.event_first_player,
    player2: m.event_second_player,
    flag1: "🏳️",
    flag2: "🏳️",
    sets: parseSets(m.scores),
    currentGame: m.event_game_result ?? "",
    server: (m.event_serve === "1" ? 1 : 2) as 1 | 2,
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

  const now = "2026-07-29";

  return raw.slice(0, 12).map((t, i) => {
    const start = t.start_date ?? now;
    const end = t.end_date ?? now;
    let status: Tournament["status"] = "upcoming";
    if (end < now) status = "completed";
    else if (start <= now) status = "live";

    return {
      id: t.tournament_key || `t${i}`,
      name: t.tournament_name,
      location: t.country_name ?? "",
      country: t.country_name ?? "",
      flag: "🏆",
      surface: toTournamentSurface(t.surface ?? ""),
      category: toCategory(t.tournament_name),
      startDate: start,
      endDate: end,
      prize: "",
      status,
      imageQuery: `tennis tournament ${t.country_name ?? t.tournament_name}`,
    };
  });
}
