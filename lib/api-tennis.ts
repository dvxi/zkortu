/**
 * API-Tennis client (https://api-tennis.com/documentation)
 *
 * Auth: `APIkey` query param, key from the api-tennis.com account.
 * The API answers HTTP 200 for almost everything, including auth failures:
 *   {"error":"1","result":[{"param":null,"msg":"Wrong login credentials","cod":1004}]}
 * so every response is checked for an error envelope before it is used.
 *
 * Verified against live responses (2026-10-24): numeric keys, `stat_won` as a
 * number, `event_live: "1"` also on finished matches, rounds prefixed with the
 * tournament name ("ATP Basel - Semi-finals"), `tournament_sourface` (sic) in
 * the tournament index.
 *
 * Caching: reads go through Next's fetch cache with explicit revalidate windows
 * (rankings 1 h, tournament index 24 h, fixtures 2 min, live scores no-store).
 */

import type {
  LiveMatch,
  MatchPlayer,
  MatchSet,
  MatchStats,
  MatchStatus,
  Player,
  PlayerApiProfile,
  PlayerSeason,
  PlayerTitle,
  Surface,
  Tour,
  Tournament,
} from "./types";
import { countryFromName, normalizeName } from "./countries";
import { isMainTourTitle, tournamentNamePl } from "./tournament-names";
import { addDaysIso } from "./format";

const BASE_URL = "https://api.api-tennis.com/tennis/";
const TIMEZONE = "Europe/Warsaw";

// ─── Errors ──────────────────────────────────────────────────────────────────

export type ApiTennisErrorCode = "no-key" | "auth" | "http" | "network" | "shape";

export class ApiTennisError extends Error {
  code: ApiTennisErrorCode;
  status?: number;
  constructor(message: string, code: ApiTennisErrorCode, status?: number) {
    super(message);
    this.name = "ApiTennisError";
    this.code = code;
    this.status = status;
  }
}

function getApiKey(): string {
  const key = process.env.API_TENNIS_KEY || process.env.RAPIDAPI_KEY || "";
  return key === "[SENSITIVE]" ? "" : key;
}

export function isApiTennisConfigured(): boolean {
  return Boolean(getApiKey());
}

/** Polish, user-facing message for an error thrown by this module. */
export function describeApiError(err: unknown): string {
  if (err instanceof ApiTennisError) {
    switch (err.code) {
      case "no-key":
        return "Brak konfiguracji klucza API-Tennis.";
      case "auth":
        return "Dostawca danych odrzucił klucz API. Sprawdź subskrypcję api-tennis.com.";
      case "network":
        return "Nie udało się połączyć z dostawcą danych.";
      default:
        return "Dostawca danych zwrócił błąd.";
    }
  }
  return "Dane są chwilowo niedostępne.";
}

// ─── Raw API shapes ──────────────────────────────────────────────────────────

type Str = string | number | null | undefined;

interface ApiEnvelope {
  success?: number | string;
  error?: number | string;
  result?: unknown;
}

interface RawErrorEntry {
  param?: string | null;
  msg?: string;
  cod?: number | string;
}

interface RawStanding {
  place: Str;
  player: string;
  player_key: Str;
  league?: string;
  movement?: string;
  country?: string;
  points: Str;
}

export interface RawTournament {
  tournament_key: Str;
  tournament_name: string;
  event_type_key?: Str;
  event_type_type?: string;
  tournament_sourface?: string | null;
}

interface RawScore {
  score_first?: Str;
  score_second?: Str;
  score_set?: Str;
}

interface RawStat {
  player_key?: Str;
  stat_period?: string;
  stat_type?: string;
  stat_name?: string;
  stat_value?: Str;
  stat_won?: Str;
  stat_total?: Str;
}

interface RawMatch {
  event_key: Str;
  event_date?: string;
  event_time?: string;
  event_first_player?: string;
  first_player_key?: Str;
  /** doubles: the pair has its own key; these are the two partners' player keys */
  first_player_dp1_key?: Str;
  first_player_dp2_key?: Str;
  event_second_player?: string;
  second_player_key?: Str;
  second_player_dp1_key?: Str;
  second_player_dp2_key?: Str;
  event_final_result?: string | null;
  event_game_result?: string | null;
  event_serve?: string | null;
  event_winner?: string | null;
  event_status?: string | null;
  event_type_type?: string;
  tournament_name?: string;
  tournament_key?: Str;
  tournament_round?: string | null;
  tournament_season?: string;
  event_live?: string;
  event_qualification?: string;
  event_first_player_logo?: string | null;
  event_second_player_logo?: string | null;
  scores?: RawScore[];
  statistics?: RawStat[];
}

const str = (v: Str): string => (v === null || v === undefined ? "" : String(v)).trim();

// ─── HTTP helper ─────────────────────────────────────────────────────────────

export type CacheMode = { revalidate: number; tags?: string[] } | "no-store";

async function apiFetch<T>(params: Record<string, string>, cache: CacheMode): Promise<T[]> {
  const key = getApiKey();
  if (!key) throw new ApiTennisError("Brak klucza API_TENNIS_KEY", "no-key");

  const url = `${BASE_URL}?${new URLSearchParams({ ...params, timezone: TIMEZONE, APIkey: key }).toString()}`;

  let res: Response;
  try {
    res = await fetch(
      url,
      cache === "no-store"
        ? { cache: "no-store" }
        : { next: { revalidate: cache.revalidate, tags: cache.tags } },
    );
  } catch (err) {
    throw new ApiTennisError(`Błąd sieci: ${(err as Error).message}`, "network");
  }
  if (!res.ok) throw new ApiTennisError(`API-Tennis HTTP ${res.status}`, "http", res.status);

  let data: ApiEnvelope;
  try {
    data = (await res.json()) as ApiEnvelope;
  } catch {
    throw new ApiTennisError("Niepoprawna odpowiedź API-Tennis", "shape");
  }

  const result = data.result;
  const errorFlag = data.error !== undefined && String(data.error) !== "0";
  const looksLikeErrorList =
    Array.isArray(result) &&
    result.length > 0 &&
    result.every((r) => r && typeof r === "object" && "cod" in (r as object) && "msg" in (r as object));

  if (errorFlag || looksLikeErrorList) {
    const msgs = Array.isArray(result)
      ? (result as RawErrorEntry[]).map((r) => r.msg).filter(Boolean).join("; ")
      : "";
    const message = msgs || "API-Tennis zwróciło błąd";
    const code: ApiTennisErrorCode = /credential|login|key|unauthor|subscri|expired|payment/i.test(message) ? "auth" : "http";
    throw new ApiTennisError(message, code);
  }

  // `{"result":"0"}` / `{"success":0}` without an error flag means "no data".
  if (!Array.isArray(result)) return [];
  return result as T[];
}

// ─── Rankings ────────────────────────────────────────────────────────────────

export async function fetchRankings(tour: "ATP" | "WTA"): Promise<Player[]> {
  const raw = await apiFetch<RawStanding>(
    { method: "get_standings", event_type: tour },
    { revalidate: 3600, tags: ["rankings", `rankings-${tour.toLowerCase()}`] },
  );

  return raw
    .map((p, i) => {
      const c = countryFromName(p.country);
      const movement = p.movement === "up" ? "up" : p.movement === "down" ? "down" : "same";
      return {
        rank: parseInt(str(p.place), 10) || i + 1,
        name: str(p.player),
        playerKey: str(p.player_key),
        countryCode: c.code,
        country: c.namePl,
        flag: c.flag,
        points: parseInt(str(p.points).replace(/[^0-9]/g, ""), 10) || 0,
        movement,
      } satisfies Player;
    })
    .sort((a, b) => a.rank - b.rank);
}

/**
 * player_key → ISO country code, built from both singles rankings.
 * Live scores and fixtures do not carry a country, so this index is the
 * cheapest way to show flags: two cached calls instead of one per player.
 */
export async function getPlayerCountryIndex(): Promise<Map<string, string | null>> {
  const index = new Map<string, string | null>();
  const results = await Promise.allSettled([fetchRankings("ATP"), fetchRankings("WTA")]);
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const p of r.value) {
      if (p.playerKey) index.set(p.playerKey, p.countryCode);
    }
  }
  return index;
}

// ─── Tournament index (names, event types, surfaces) ─────────────────────────

export async function fetchTournamentIndex(): Promise<RawTournament[]> {
  return apiFetch<RawTournament>({ method: "get_tournaments" }, { revalidate: 86400, tags: ["tournament-index"] });
}

export function toSurface(value: string | null | undefined): Surface | undefined {
  const s = (value ?? "").toLowerCase();
  if (!s) return undefined;
  if (s.includes("clay")) return "Clay";
  if (s.includes("grass")) return "Grass";
  if (s.includes("indoor") || s.includes("carpet")) return "Indoor Hard";
  if (s.includes("hard")) return "Hard";
  return undefined;
}

/** tournament_key → surface, cached with the index. Never throws. */
async function getSurfaceIndex(): Promise<Map<string, Surface>> {
  const map = new Map<string, Surface>();
  try {
    const index = await fetchTournamentIndex();
    for (const t of index) {
      const surface = toSurface(t.tournament_sourface);
      if (surface) map.set(str(t.tournament_key), surface);
    }
  } catch {
    /* surface is a nice-to-have */
  }
  return map;
}

// ─── Match normalisation ─────────────────────────────────────────────────────

const ROUND_PL: Record<string, string> = {
  final: "Finał",
  finals: "Finał",
  "semi-final": "Półfinał",
  "semi-finals": "Półfinał",
  semifinal: "Półfinał",
  semifinals: "Półfinał",
  "quarter-final": "Ćwierćfinał",
  "quarter-finals": "Ćwierćfinał",
  quarterfinal: "Ćwierćfinał",
  quarterfinals: "Ćwierćfinał",
  "round of 16": "1/8 finału",
  "round of 32": "1/16 finału",
  "round of 64": "1/32 finału",
  "round of 128": "1/64 finału",
  "1st round": "1. runda",
  "2nd round": "2. runda",
  "3rd round": "3. runda",
  "4th round": "4. runda",
  "round robin": "Faza grupowa",
  qualifying: "Kwalifikacje",
  qualification: "Kwalifikacje",
  "qualification round 1": "Kwalifikacje, 1. runda",
  "qualification round 2": "Kwalifikacje, 2. runda",
  "qualification round 3": "Kwalifikacje, 3. runda",
  "qualifying round 1": "Kwalifikacje, 1. runda",
  "qualifying round 2": "Kwalifikacje, 2. runda",
  "qualifying round 3": "Kwalifikacje, 3. runda",
};

/** "ATP Basel - Semi-finals" → "Półfinał"; "W35 Sydney - 1/8-finals" → "1/8 finału" */
export function translateRound(round: string | null | undefined): string {
  if (!round) return "";
  const parts = round.split(" - ");
  const last = parts[parts.length - 1].trim();
  const key = last.toLowerCase();
  if (ROUND_PL[key]) return ROUND_PL[key];
  const fraction = key.match(/^1\/(\d+)[\s-]*finals?$/);
  if (fraction) return `1/${fraction[1]} finału`;
  const group = key.match(/^group\s+(\w+)$/);
  if (group) return `Grupa ${group[1].toUpperCase()}`;
  const qualifying = key.match(/^qualif\w*\s*(?:-\s*)?(\d)(?:st|nd|rd|th)?\s*round$/);
  if (qualifying) return `Kwalifikacje, ${qualifying[1]}. runda`;
  return last;
}

/** "Półfinał" → "Półfinał kwalifikacji"; labels that already say so stay as they are. */
export function qualifyingRound(round: string): string {
  if (!round) return "Kwalifikacje";
  return /kwalifikac/i.test(round) ? round : `${round} kwalifikacji`;
}

export function tourFromEventType(eventType: string | undefined): Tour {
  const t = (eventType ?? "").toLowerCase();
  if (t.includes("challenger")) return "Challenger";
  if (t.includes("itf")) return "ITF";
  if (t.includes("boys") || t.includes("girls") || t.includes("junior")) return "Junior";
  if (t.startsWith("atp")) return "ATP";
  if (t.startsWith("wta")) return "WTA";
  return "Other";
}

/** "Florence (Italy) - Qualification" → { name: "Florence (Italy)", qualifying: true } */
function parseTournamentName(raw: string | undefined): { name: string; qualifying: boolean } {
  const name = (raw ?? "").trim();
  const m = name.match(/^(.*?)\s*-\s*qualif\w*$/i);
  if (m) return { name: m[1].trim(), qualifying: true };
  return { name, qualifying: false };
}

/**
 * The feed appends tiebreak points to the games: "77" = 7 games, 7 tiebreak points,
 * "65" = 6 games, 5 points, "710" = 7 games, 10 points. Match tiebreaks ("10", "12")
 * start with 1 and are kept whole.
 */
function parseSetScore(value: Str): { games: number; tb: number | null } | null {
  const digits = str(value).replace(/[^0-9]/g, "");
  if (!digits) return null;
  if (digits.length >= 2 && (digits[0] === "6" || digits[0] === "7")) {
    return { games: Number(digits[0]), tb: Number(digits.slice(1)) };
  }
  return { games: Number(digits.slice(0, 2)), tb: null };
}

function parseSets(scores: RawScore[] | undefined): MatchSet[] {
  if (!scores?.length) return [];
  const sets: MatchSet[] = [];
  for (const s of scores) {
    const a = parseSetScore(s.score_first);
    const b = parseSetScore(s.score_second);
    if (!a && !b) continue;
    const set: MatchSet = { p1: a?.games ?? 0, p2: b?.games ?? 0 };
    if (a?.tb !== null && a?.tb !== undefined || b?.tb !== null && b?.tb !== undefined) set.tb = [a?.tb ?? null, b?.tb ?? null];
    sets.push(set);
  }
  return sets;
}

function parseStatus(m: RawMatch): { status: MatchStatus; label: string } {
  const raw = str(m.event_status);
  const lower = raw.toLowerCase();
  // order matters: the live feed keeps event_live="1" on matches that just finished
  if (/cancel|postpon|abandon/.test(lower)) return { status: "cancelled", label: "Odwołany" };
  if (/retire|ret\./.test(lower)) return { status: "finished", label: "Krecz" };
  if (/walk\s*over|w\/o/.test(lower)) return { status: "finished", label: "Walkower" };
  if (/finish|default|ended|complete/.test(lower)) return { status: "finished", label: "Zakończony" };
  if (m.event_winner) return { status: "finished", label: "Zakończony" };
  if (/^set\s*\d/.test(lower) || /in progress|live|break|tie/.test(lower)) {
    return { status: "live", label: raw.replace(/^set\s*/i, "Set ") };
  }
  if (m.event_live === "1" && raw) return { status: "live", label: raw };
  if (!raw || /not started|scheduled|^ns$/.test(lower)) return { status: "upcoming", label: "Nadchodzący" };
  return { status: "upcoming", label: raw };
}

function firstNumber(value: Str): number | null {
  const s = str(value);
  if (!s) return null;
  const m = s.match(/-?\d+(?:[.,]\d+)?/);
  if (!m) return null;
  return Math.round(parseFloat(m[0].replace(",", ".")));
}

function ratio(entry: RawStat | undefined): string | null {
  if (!entry) return null;
  const won = firstNumber(entry.stat_won);
  const total = firstNumber(entry.stat_total);
  if (won !== null && total !== null) return `${won}/${total}`;
  return str(entry.stat_value) || null;
}

type NumKey = "aces" | "doubleFaults" | "firstServePct" | "firstServeWon" | "secondServeWon" | "winners" | "unforcedErrors" | "totalPointsWon";
type RatioKey = "breakPoints" | "breakPointsSaved";

const NUMERIC_STATS: Array<{ key: NumKey; test: (name: string) => boolean; useWon?: boolean }> = [
  { key: "aces", test: (n) => n === "aces" || n === "ace" },
  { key: "doubleFaults", test: (n) => n.includes("double fault") },
  { key: "firstServePct", test: (n) => n.includes("1st serve") && n.includes("percent") },
  { key: "firstServeWon", test: (n) => n.includes("1st serve points won") },
  { key: "secondServeWon", test: (n) => n.includes("2nd serve points won") },
  { key: "winners", test: (n) => n === "winners" },
  { key: "unforcedErrors", test: (n) => n.includes("unforced") },
  { key: "totalPointsWon", test: (n) => n.includes("total points won"), useWon: true },
];

const RATIO_STATS: Array<{ key: RatioKey; test: (name: string) => boolean }> = [
  { key: "breakPoints", test: (n) => n.includes("break points converted") },
  { key: "breakPointsSaved", test: (n) => n.includes("break points saved") },
];

function parseStats(m: RawMatch): MatchStats | null {
  const stats = m.statistics;
  if (!stats?.length) return null;
  const p1 = str(m.first_player_key);
  const p2 = str(m.second_player_key);
  const matchPeriod = stats.filter((s) => (s.stat_period ?? "").toLowerCase() === "match");
  const source = matchPeriod.length ? matchPeriod : stats;
  const find = (playerKey: string, test: (name: string) => boolean) =>
    source.find((s) => str(s.player_key) === playerKey && test((s.stat_name ?? "").toLowerCase().trim()));

  const out: MatchStats = {};
  let any = false;
  for (const stat of NUMERIC_STATS) {
    const e1 = find(p1, stat.test);
    const e2 = find(p2, stat.test);
    if (!e1 && !e2) continue;
    const pick = (e: RawStat | undefined) => (e ? (stat.useWon ? firstNumber(e.stat_won) ?? firstNumber(e.stat_value) : firstNumber(e.stat_value)) ?? 0 : 0);
    out[stat.key] = [pick(e1), pick(e2)];
    any = true;
  }
  for (const stat of RATIO_STATS) {
    const r1 = ratio(find(p1, stat.test));
    const r2 = ratio(find(p2, stat.test));
    if (r1 === null && r2 === null) continue;
    out[stat.key] = [r1 ?? "0", r2 ?? "0"];
    any = true;
  }
  return any ? out : null;
}

/** A doubles pair shows a flag only when both partners come from the same country. */
function pairCountry(partnerKeys: Str[], countryIndex: Map<string, string | null>): string | null {
  const codes = partnerKeys.map((k) => countryIndex.get(str(k)) ?? null);
  return codes.length === 2 && codes[0] && codes[0] === codes[1] ? codes[0] : null;
}

function toMatchPlayer(name: string | undefined, key: Str, countryIndex: Map<string, string | null>, partnerKeys: Str[] = []): MatchPlayer {
  const k = str(key);
  const code = countryIndex.get(k) ?? (partnerKeys.length ? pairCountry(partnerKeys, countryIndex) : null);
  const c = countryFromName(code ?? "");
  return { name: (name ?? "").trim() || "—", key: k, countryCode: code, flag: code ? c.flag : "" };
}

export function toMatch(m: RawMatch, countryIndex: Map<string, string | null>, surfaceIndex?: Map<string, Surface>): LiveMatch {
  const { status, label } = parseStatus(m);
  const eventType = m.event_type_type ?? "";
  const winner = /first/i.test(m.event_winner ?? "") ? 1 : /second/i.test(m.event_winner ?? "") ? 2 : null;
  const serve = m.event_serve === "First Player" ? 1 : m.event_serve === "Second Player" ? 2 : null;
  const game = str(m.event_game_result).replace(/\s+/g, " ");
  const { name: tournament, qualifying } = parseTournamentName(m.tournament_name);
  const tournamentKey = str(m.tournament_key);
  const finalResult = str(m.event_final_result);
  // qualifying draws share the main draw's tournament key and round names ("Semi-finals");
  // only `event_qualification` tells them apart (verified on live data, 2026-10-24)
  const isQualifying = qualifying || /qualif/i.test(m.tournament_round ?? "") || str(m.event_qualification).toLowerCase() === "true";
  const round = translateRound(m.tournament_round);
  return {
    id: str(m.event_key),
    tournament: tournamentNamePl(tournament),
    tournamentKey,
    eventType,
    tour: tourFromEventType(eventType),
    isDoubles: /double/i.test(eventType),
    isQualifying,
    round: isQualifying ? qualifyingRound(round) : round,
    date: (m.event_date ?? "").slice(0, 10),
    time: (m.event_time ?? "").slice(0, 5),
    player1: toMatchPlayer(m.event_first_player, m.first_player_key, countryIndex, [m.first_player_dp1_key, m.first_player_dp2_key].filter((k) => str(k))),
    player2: toMatchPlayer(m.event_second_player, m.second_player_key, countryIndex, [m.second_player_dp1_key, m.second_player_dp2_key].filter((k) => str(k))),
    sets: parseSets(m.scores),
    currentGame: status === "live" && game !== "-" ? game : "",
    server: status === "live" ? serve : null,
    status,
    statusLabel: label,
    winner,
    stats: parseStats(m),
    surface: surfaceIndex?.get(tournamentKey),
    finalResult: finalResult === "-" ? "" : finalResult,
  };
}

// ─── Live scores ─────────────────────────────────────────────────────────────

export type LiveScope = "tour" | "all";

export function isMainTour(match: Pick<LiveMatch, "tour">): boolean {
  return match.tour === "ATP" || match.tour === "WTA";
}

/**
 * All matches in the live feed (in play + just finished). `scope: "tour"` keeps ATP/WTA only.
 * `cache` defaults to no-store (API routes); ISR pages pass a short revalidate to embed
 * an initial snapshot in the HTML and let the client poll for updates.
 */
export async function fetchLiveScores(scope: LiveScope = "tour", cache: CacheMode = "no-store"): Promise<LiveMatch[]> {
  const [raw, countryIndex, surfaceIndex] = await Promise.all([
    apiFetch<RawMatch>({ method: "get_livescore" }, cache),
    getPlayerCountryIndex(),
    getSurfaceIndex(),
  ]);
  const matches = raw.map((m) => toMatch(m, countryIndex, surfaceIndex));
  const filtered = scope === "tour" ? matches.filter(isMainTour) : matches;
  return sortMatches(filtered);
}

export function sortMatches(matches: LiveMatch[]): LiveMatch[] {
  const order: Record<MatchStatus, number> = { live: 0, upcoming: 1, finished: 2, cancelled: 3 };
  const tourOrder: Record<Tour, number> = { ATP: 0, WTA: 0, Challenger: 1, ITF: 2, Junior: 3, Other: 4 };
  return [...matches].sort((a, b) => {
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    if (tourOrder[a.tour] !== tourOrder[b.tour]) return tourOrder[a.tour] - tourOrder[b.tour];
    if (a.isDoubles !== b.isDoubles) return a.isDoubles ? 1 : -1;
    if (a.isQualifying !== b.isQualifying) return a.isQualifying ? 1 : -1;
    return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
  });
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

export interface FixtureQuery {
  dateStart: string;
  dateStop: string;
  tournamentKey?: string;
  eventTypeKey?: string;
  playerKey?: string;
}

export async function fetchFixtures(q: FixtureQuery, scope: LiveScope = "all", cache: CacheMode = { revalidate: 120, tags: ["fixtures"] }): Promise<LiveMatch[]> {
  const params: Record<string, string> = { method: "get_fixtures", date_start: q.dateStart, date_stop: q.dateStop };
  if (q.tournamentKey) params.tournament_key = q.tournamentKey;
  if (q.eventTypeKey) params.event_type_key = q.eventTypeKey;
  if (q.playerKey) params.player_key = q.playerKey;
  const [raw, countryIndex, surfaceIndex] = await Promise.all([
    apiFetch<RawMatch>(params, cache),
    getPlayerCountryIndex(),
    getSurfaceIndex(),
  ]);
  const matches = raw.map((m) => toMatch(m, countryIndex, surfaceIndex));
  return sortMatches(scope === "tour" ? matches.filter(isMainTour) : matches);
}

interface RawEventType {
  event_type_key: Str;
  event_type_type?: string;
}

/** event type name (lowercase) → key, cached 24 h. */
async function getEventTypeIndex(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const raw = await apiFetch<RawEventType>({ method: "get_events" }, { revalidate: 86400, tags: ["event-types"] });
    for (const e of raw) map.set((e.event_type_type ?? "").toLowerCase().trim(), str(e.event_type_key));
  } catch {
    /* fall back to an unfiltered request */
  }
  return map;
}

const TOUR_EVENT_TYPES = ["atp singles", "wta singles", "atp doubles", "wta doubles"];

// A whole day of fixtures across ITF/Challenger is ~4 MB, above Next's 2 MB data-cache
// limit, so the main-tour request is split per event type (small, cacheable) and the
// "all" request is memoised in-process for two minutes.
const dayCache = new Map<string, { at: number; matches: LiveMatch[] }>();

/** Matches scheduled for a given day (Europe/Warsaw). */
export async function fetchMatchesForDay(dateIso: string, scope: LiveScope = "tour"): Promise<LiveMatch[]> {
  if (scope === "tour") {
    const types = await getEventTypeIndex();
    const keys = TOUR_EVENT_TYPES.map((n) => types.get(n)).filter((k): k is string => Boolean(k));
    if (keys.length === TOUR_EVENT_TYPES.length) {
      const results = await Promise.allSettled(keys.map((k) => fetchFixtures({ dateStart: dateIso, dateStop: dateIso, eventTypeKey: k }, "all")));
      const failed = results.find((r) => r.status === "rejected");
      const matches = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      if (failed && matches.length === 0) throw (failed as PromiseRejectedResult).reason;
      return sortMatches(matches.filter(isMainTour));
    }
    return fetchFixtures({ dateStart: dateIso, dateStop: dateIso }, "tour");
  }
  const cacheKey = `${dateIso}:all`;
  const hit = dayCache.get(cacheKey);
  if (hit && Date.now() - hit.at < 120_000) return hit.matches;
  const matches = await fetchFixtures({ dateStart: dateIso, dateStop: dateIso }, "all");
  dayCache.set(cacheKey, { at: Date.now(), matches });
  return matches;
}

// ─── Matches with a given nationality (homepage "Mecze Polek i Polaków") ─────

/**
 * True when any player in the match (singles player or doubles partner) has the
 * given ISO country code. Countries come from the singles rankings, so doubles
 * specialists without a singles ranking are not recognised.
 */
export function hasPlayerFrom(m: RawMatch, countryCode: string, countryIndex: Map<string, string | null>, extraKeys: ReadonlySet<string> = new Set()): boolean {
  const keys = [m.first_player_key, m.second_player_key, m.first_player_dp1_key, m.first_player_dp2_key, m.second_player_dp1_key, m.second_player_dp2_key];
  return keys.some((k) => str(k) !== "" && (countryIndex.get(str(k)) === countryCode || extraKeys.has(str(k))));
}

/**
 * All of a day's matches (every level, singles and doubles) with a player from
 * `countryCode`. One upstream request; the response (~3 MB) is above Next's 2 MB
 * fetch-cache limit, so it is fetched uncached and callers cache the filtered
 * result (see lib/polish-matches.ts).
 */
export async function fetchMatchesWithCountry(dateIso: string, countryCode: string, extraKeys: string[] = []): Promise<LiveMatch[]> {
  const extra = new Set(extraKeys);
  const [raw, countryIndex, surfaceIndex] = await Promise.all([
    apiFetch<RawMatch>({ method: "get_fixtures", date_start: dateIso, date_stop: dateIso }, "no-store"),
    getPlayerCountryIndex(),
    getSurfaceIndex(),
  ]);
  return sortMatches(raw.filter((m) => hasPlayerFrom(m, countryCode, countryIndex, extra)).map((m) => toMatch(m, countryIndex, surfaceIndex)));
}

// ─── Player profiles (/zawodnicy) ────────────────────────────────────────────

interface RawPlayerStat {
  season?: Str;
  type?: string;
  rank?: Str;
  titles?: Str;
  matches_won?: Str;
  matches_lost?: Str;
  hard_won?: Str;
  hard_lost?: Str;
  clay_won?: Str;
  clay_lost?: Str;
  grass_won?: Str;
  grass_lost?: Str;
}

interface RawPlayerTournament {
  name?: string;
  season?: Str;
  type?: string;
  surface?: string;
  prize?: string | null;
}

interface RawPlayer {
  player_key: Str;
  player_name?: string;
  player_full_name?: string;
  player_country?: string;
  player_bday?: string;
  stats?: RawPlayerStat[];
  tournaments?: RawPlayerTournament[];
}

const int = (v: Str): number => parseInt(str(v), 10) || 0;

/** "31.05.2001" → "2001-05-31"; the feed uses 01.01.1970 for "unknown". */
function parseBirthDate(v: string | undefined): string | null {
  const m = (v ?? "").match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m || Number(m[3]) < 1975) return null;
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

export function toPlayerProfile(p: RawPlayer): PlayerApiProfile {
  // the feed has junk seasons ("", "0", "1") for some players; keep real years only
  const isYear = (v: Str) => /^\d{4}$/.test(str(v));
  const singles: PlayerSeason[] = (p.stats ?? [])
    .filter((s) => s.type === "singles" && isYear(s.season))
    .map((s) => ({
      season: int(s.season),
      rank: int(s.rank) || null,
      titles: int(s.titles),
      won: int(s.matches_won),
      lost: int(s.matches_lost),
      hard: [int(s.hard_won), int(s.hard_lost)] as [number, number],
      clay: [int(s.clay_won), int(s.clay_lost)] as [number, number],
      grass: [int(s.grass_won), int(s.grass_lost)] as [number, number],
    }))
    // the feed sometimes adds an empty duplicate row for a season: keep the fuller one
    .reduce<PlayerSeason[]>((acc, s) => {
      const i = acc.findIndex((x) => x.season === s.season);
      if (i === -1) acc.push(s);
      else if (s.won + s.lost > acc[i].won + acc[i].lost) acc[i] = s;
      return acc;
    }, [])
    .sort((a, b) => b.season - a.season);
  // junior Grand Slams come as plain "Wimbledon": no prize money, won before 19
  const birthYear = Number((parseBirthDate(p.player_bday) ?? "").slice(0, 4)) || null;
  const isJuniorTitle = (t: RawPlayerTournament) => birthYear !== null && int(t.season) - birthYear < 19 && !/[1-9]/.test(str(t.prize));
  const singlesTitles: PlayerTitle[] = (p.tournaments ?? [])
    .filter((t) => t.type === "singles" && isYear(t.season) && t.name && isMainTourTitle(str(t.name)) && !isJuniorTitle(t))
    .map((t) => ({ name: str(t.name), season: int(t.season), surface: toSurface(t.surface) }))
    .sort((a, b) => b.season - a.season);
  const country = countryFromName(p.player_country);
  return {
    key: str(p.player_key),
    name: str(p.player_name),
    fullName: str(p.player_full_name) || str(p.player_name),
    countryCode: country.code,
    birthDate: parseBirthDate(p.player_bday),
    singles,
    singlesTitles,
  };
}

/** Bio, season-by-season singles stats and titles; changes slowly, cached 12 h. */
export async function fetchPlayerProfile(playerKey: string): Promise<PlayerApiProfile | null> {
  const raw = await apiFetch<RawPlayer>({ method: "get_players", player_key: playerKey }, { revalidate: 43200, tags: ["player-profiles", `player:${playerKey}`] });
  return raw[0] ? toPlayerProfile(raw[0]) : null;
}

const surfaceBucket = (s: Surface | undefined): "hard" | "clay" | "grass" | null =>
  !s ? null : /clay/i.test(s) ? "clay" : /grass/i.test(s) ? "grass" : "hard";

/**
 * Season record and titles computed from the player's own matches. get_players lags
 * behind: titles of the season in progress are missing and some players have no
 * current-season row at all. Counts main-draw ATP/WTA singles only (no qualifying,
 * Challenger, ITF or team events); walkovers are not counted as played matches but a
 * final won by walkover is still a title.
 */
export function summarizeSeason(matches: LiveMatch[], playerKey: string, season: number): { season: PlayerSeason; titles: PlayerTitle[] } {
  const year = String(season);
  const singles = matches.filter(
    (m) => !m.isDoubles && isMainTour(m) && !m.isQualifying && m.status === "finished" && m.winner && m.date.startsWith(year) && (m.player1.key === playerKey || m.player2.key === playerKey),
  );
  const row: PlayerSeason = { season, rank: null, titles: 0, won: 0, lost: 0, hard: [0, 0], clay: [0, 0], grass: [0, 0] };
  const titles: PlayerTitle[] = [];
  for (const m of singles) {
    const won = m.winner === (m.player1.key === playerKey ? 1 : 2);
    if (won && m.round === "Finał") titles.push({ name: m.tournament, season, surface: m.surface });
    if (m.statusLabel === "Walkower") continue;
    if (won) row.won++;
    else row.lost++;
    const bucket = surfaceBucket(m.surface);
    if (bucket) row[bucket][won ? 0 : 1]++;
  }
  row.titles = titles.length;
  return { season: row, titles };
}

/**
 * Season table and title list for a profile: get_players data, plus the current season
 * computed from matches (row added when the API has none, titles the API has not listed
 * yet). Per-season title counts are recomputed from the main-tour title list so the
 * table and the title box always agree.
 */
export function mergePlayerStats(
  api: PlayerApiProfile | null,
  current: { season: PlayerSeason; titles: PlayerTitle[] } | null,
  currentRank: number | null,
): { seasons: PlayerSeason[]; titles: PlayerTitle[] } {
  const apiTitles = api?.singlesTitles ?? [];
  const same = (a: string, b: string) => {
    const x = normalizeName(tournamentNamePl(a));
    const y = normalizeName(tournamentNamePl(b));
    return x === y || x.includes(y) || y.includes(x);
  };
  const missing = (current?.titles ?? []).filter((t) => !apiTitles.some((a) => a.season === t.season && same(a.name, t.name)));
  const titles = [...missing, ...apiTitles].sort((a, b) => b.season - a.season);

  const seasons = [...(api?.singles ?? [])];
  if (current) {
    const i = seasons.findIndex((s) => s.season === current.season.season);
    const played = current.season.won + current.season.lost > 0 || current.titles.length > 0;
    if (i === -1 && played) seasons.push({ ...current.season, rank: currentRank });
    else if (i !== -1 && currentRank && !seasons[i].rank) seasons[i] = { ...seasons[i], rank: currentRank };
  }
  return {
    seasons: seasons.map((s) => ({ ...s, titles: titles.filter((t) => t.season === s.season).length })).sort((a, b) => b.season - a.season),
    titles,
  };
}

/** All of the player's matches this season (Jan 1 → today), uncached: the response can exceed 2 MB. */
export async function fetchPlayerSeasonMatches(playerKey: string, today: string): Promise<LiveMatch[]> {
  return fetchFixtures({ dateStart: `${today.slice(0, 4)}-01-01`, dateStop: today, playerKey }, "all", "no-store");
}

/** The player's matches from the last 60 days and the next 7 (newest first), cached 1 h. */
export async function fetchPlayerMatches(playerKey: string, today: string): Promise<LiveMatch[]> {
  const matches = await fetchFixtures(
    { dateStart: addDaysIso(today, -60), dateStop: addDaysIso(today, 7), playerKey },
    "all",
    { revalidate: 3600, tags: ["player-matches", `player:${playerKey}`] },
  );
  return matches.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
}

// ─── Calendar ↔ API matching ─────────────────────────────────────────────────

const GENERIC_TOKENS = new Set([
  "atp", "wta", "open", "masters", "championships", "championship", "cup", "tennis", "international",
  "classic", "tour", "finals", "the", "of", "de", "del", "di", "and", "&", "250", "500", "1000",
  "men", "women", "singles", "doubles", "world", "grand", "slam", "by", "presented", "trophy", "prix",
  "indoor", "indoors", "qualification",
]);

/** Polish spellings used by the editorial calendar → names used by API-Tennis. */
const CITY_ALIASES: Record<string, string> = {
  paryz: "Paris", londyn: "London", madryt: "Madrid", rzym: "Rome", szanghaj: "Shanghai", dubaj: "Dubai",
  wieden: "Vienna", bazylea: "Basel", genewa: "Geneva", antwerpia: "Antwerp", sztokholm: "Stockholm",
  turyn: "Turin", pekin: "Beijing", strasburg: "Strasbourg", rijad: "Riyadh", tokio: "Tokyo",
  waszyngton: "Washington", "nowy jork": "New York", monachium: "Munich", bruksela: "Brussels",
  lizbona: "Lisbon", ateny: "Athens", kolonia: "Cologne", praga: "Prague", warszawa: "Warsaw",
  budapeszt: "Budapest", bukareszt: "Bucharest", belgrad: "Belgrade", zagrzeb: "Zagreb", mediolan: "Milan",
  florencja: "Florence", neapol: "Naples", sewilla: "Seville", marsylia: "Marseille", nicea: "Nice",
  majorka: "Mallorca", marrakesz: "Marrakech", kair: "Cairo", hongkong: "Hong Kong", seul: "Seoul",
  kanton: "Guangzhou", nankin: "Nanjing", tiencin: "Tianjin", ostrawa: "Ostrava", kluz: "Cluj",
  tallin: "Tallinn", meksyk: "Mexico City", rio: "Rio de Janeiro", "sankt petersburg": "St. Petersburg",
  moskwa: "Moscow", chengdu: "Chengdu", "monte carlo": "Monte Carlo", "indian wells": "Indian Wells",
};

/** Tournament brand names → how API-Tennis labels them. */
const TOURNAMENT_ALIASES: Array<{ test: RegExp; aliases: string[] }> = [
  { test: /roland garros|french open/i, aliases: ["French Open", "Roland Garros"] },
  { test: /australian open/i, aliases: ["Australian Open", "Melbourne"] },
  { test: /wimbledon/i, aliases: ["Wimbledon"] },
  { test: /us open/i, aliases: ["US Open", "New York"] },
  { test: /atp finals/i, aliases: ["ATP Finals", "Turin"] },
  { test: /wta finals/i, aliases: ["WTA Finals", "Riyadh"] },
  { test: /national bank open|canadian open|rogers cup/i, aliases: ["Toronto", "Montreal", "Canada"] },
  { test: /queen'?s/i, aliases: ["London", "Queens Club"] },
  { test: /monte[- ]carlo/i, aliases: ["Monte Carlo", "Monte-Carlo"] },
];

function aliasesFor(t: { name: string; location: string }): string[] {
  const out: string[] = [];
  const loc = normalizeName(t.location);
  if (CITY_ALIASES[loc]) out.push(CITY_ALIASES[loc]);
  for (const [pl, en] of Object.entries(CITY_ALIASES)) {
    if (normalizeName(t.name).includes(pl)) out.push(en);
  }
  for (const rule of TOURNAMENT_ALIASES) if (rule.test.test(t.name)) out.push(...rule.aliases);
  return out;
}

function tokens(input: string): string[] {
  return normalizeName(input)
    .split(" ")
    .filter((t) => t.length > 2 && !GENERIC_TOKENS.has(t) && !/^\d{4}$/.test(t));
}

function wantedEventTypes(category: string): Array<"atp" | "wta"> {
  if (category.startsWith("ATP")) return ["atp"];
  if (category.startsWith("WTA")) return ["wta"];
  return ["atp", "wta"];
}

export interface ResolvedTournament {
  key: string;
  name: string;
  eventType: string;
  score: number;
}

/**
 * Find API-Tennis singles entries for a calendar tournament, per tour.
 * Scoring: shared distinctive tokens (name + city + English aliases),
 * +0.5 when the surface agrees, qualification entries are attached to the
 * winning main-draw entry so qualifying rounds come along.
 */
export function matchTournamentInIndex(
  t: Pick<Tournament, "name" | "location" | "category" | "surface"> & { aliases?: string[] },
  index: RawTournament[],
): ResolvedTournament[] {
  const brandAliases = [...(t.aliases ?? []), ...TOURNAMENT_ALIASES.filter((r) => r.test.test(t.name)).flatMap((r) => r.aliases)];
  const cityAliases = aliasesFor(t).filter((a) => !brandAliases.includes(a));
  const aliases = [...brandAliases, ...cityAliases];
  const nameTokens = new Set([...tokens(t.name), ...tokens(t.location), ...aliases.flatMap(tokens)]);
  const exactName = normalizeName(t.name.replace(/\s+\d{4}$/, ""));
  const exactAliases = new Set(brandAliases.map((n) => normalizeName(n)).filter(Boolean));
  const exactCities = new Set([t.location, ...cityAliases].map((n) => normalizeName(n)).filter(Boolean));
  if (nameTokens.size === 0) return [];
  const results: ResolvedTournament[] = [];
  for (const et of wantedEventTypes(t.category)) {
    // group index entries by base name so a main draw and its qualification share a score;
    // some editions exist only under a "- Qualification" entry (e.g. Lyon in October)
    interface Group { name: string; eventType: string; score: number; keys: Array<{ key: string; qualifying: boolean }> }
    const groups = new Map<string, Group>();
    for (const raw of index) {
      const type = (raw.event_type_type ?? "").toLowerCase();
      if (!type.startsWith(et) || !type.includes("single")) continue;
      const parsed = parseTournamentName(raw.tournament_name);
      const candidateTokens = tokens(parsed.name);
      if (candidateTokens.length === 0) continue;
      const hits = candidateTokens.filter((tok) => nameTokens.has(tok)).length;
      if (hits === 0) continue;
      let score = hits - (candidateTokens.length - hits) * 0.25;
      if (toSurface(raw.tournament_sourface) === t.surface) score += 0.5;
      // exact matches beat partial token overlap: tournament name > brand alias > city
      const candNorm = normalizeName(parsed.name).replace(/^(atp|wta)\s+/, "");
      if (candNorm === exactName) score += 3;
      else if (exactAliases.has(candNorm)) score += 2;
      else if (exactCities.has(candNorm)) score += 1;
      // "Tokyo 2", "Brisbane 2" are secondary events unless the calendar says so
      if (/\s\d$/.test(candNorm) && candNorm !== exactName && !exactAliases.has(candNorm)) score -= 0.5;
      const g = groups.get(candNorm) ?? { name: parsed.name, eventType: raw.event_type_type ?? "", score, keys: [] };
      g.score = Math.max(g.score, score);
      g.keys.push({ key: str(raw.tournament_key), qualifying: parsed.qualifying });
      groups.set(candNorm, g);
    }
    const ranked = Array.from(groups.values()).sort((a, b) => b.score - a.score);
    // best first; runners-up within 2.5 points are kept as fallbacks: the same city can have
    // several keys per season ("Lyon" in May, "Lyon (France)" in October)
    const kept = ranked.filter((g, i) => i === 0 || g.score >= ranked[0].score - 2.5).slice(0, 4);
    for (const g of kept) {
      for (const k of g.keys.sort((a, b) => Number(a.qualifying) - Number(b.qualifying))) {
        results.push({ key: k.key, name: k.qualifying ? `${g.name} - Qualification` : g.name, eventType: g.eventType, score: k.qualifying ? g.score - 0.01 : g.score });
      }
    }
  }
  return results;
}

/**
 * Resolve API-Tennis `tournament_key`s for a calendar tournament.
 * Explicit `apiTournamentKey` wins (comma separated for ATP + WTA).
 */
export async function resolveTournamentKeys(
  t: Pick<Tournament, "name" | "location" | "category" | "surface" | "apiTournamentKey">,
): Promise<string[]> {
  if (t.apiTournamentKey) {
    return t.apiTournamentKey.split(/[,\s]+/).map((k) => k.trim()).filter(Boolean);
  }
  let index: RawTournament[];
  try {
    index = await fetchTournamentIndex();
  } catch {
    return [];
  }
  return Array.from(new Set(matchTournamentInIndex(t, index).map((r) => r.key)));
}

/**
 * All singles matches of a calendar tournament (qualifying window included).
 * Candidate keys are tried best-first per tour; the first key that has fixtures
 * in the date window wins, so a wrong-edition key (e.g. the May event of a city
 * that also hosts an October event) does not hide the matches.
 */
export async function fetchTournamentMatches(t: Tournament): Promise<LiveMatch[]> {
  if (!t.startDate) return [];
  const dateStart = addDaysIso(t.startDate, -3);
  const dateStop = t.endDate || addDaysIso(t.startDate, 14);
  const load = (key: string) => fetchFixtures({ dateStart, dateStop, tournamentKey: key }, "all");

  let matches: LiveMatch[] = [];
  if (t.apiTournamentKey) {
    const keys = t.apiTournamentKey.split(/[,\s]+/).map((k) => k.trim()).filter(Boolean);
    const results = await Promise.allSettled(keys.map(load));
    matches = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  }
  if (matches.length === 0) {
    let index: RawTournament[] = [];
    try {
      index = await fetchTournamentIndex();
    } catch {
      return [];
    }
    const candidates = matchTournamentInIndex(t, index);
    const byTour = new Map<string, ResolvedTournament[]>();
    for (const c of candidates) {
      const tour = (c.eventType.split(" ")[0] ?? "").toLowerCase();
      byTour.set(tour, [...(byTour.get(tour) ?? []), c]);
    }
    for (const list of byTour.values()) {
      // group main draw + its qualification by base name, try groups best-first
      const groups = new Map<string, string[]>();
      for (const c of list) {
        const base = normalizeName(parseTournamentName(c.name).name);
        groups.set(base, [...(groups.get(base) ?? []), c.key]);
      }
      for (const keys of groups.values()) {
        const results = await Promise.allSettled(keys.map(load));
        const found = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
        if (found.length > 0) {
          matches.push(...found);
          break;
        }
      }
    }
  }
  const singles = matches.filter((m) => !m.isDoubles).map((m) => ({ ...m, surface: m.surface ?? t.surface }));
  return sortMatches(singles);
}
