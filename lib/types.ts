// ─── Shared domain types for zkortu.pl ───────────────────────────────────────
// Data comes from two sources: API-Tennis (rankings, live scores, fixtures)
// and Sanity (articles, tournament calendar, videos, settings). These types are
// the normalized shapes the UI consumes.

export type Surface = "Hard" | "Clay" | "Grass" | "Indoor Hard";

export type TournamentCategory =
  | "Grand Slam"
  | "ATP Finals"
  | "WTA Finals"
  | "ATP 1000"
  | "ATP 500"
  | "ATP 250"
  | "WTA 1000"
  | "WTA 500"
  | "WTA 250"
  | "Inne";

export type TournamentStatus = "live" | "upcoming" | "completed";

export type Tour = "ATP" | "WTA" | "Challenger" | "ITF" | "Junior" | "Other";

// ─── Rankings ────────────────────────────────────────────────────────────────

export type RankMovement = "up" | "down" | "same";

export interface Player {
  rank: number;
  name: string;
  playerKey: string;
  /** ISO 3166-1 alpha-2, null when the API country could not be resolved */
  countryCode: string | null;
  /** Polish country name */
  country: string;
  flag: string;
  points: number;
  movement: RankMovement;
}

// ─── Matches (live scores + fixtures) ────────────────────────────────────────

export interface MatchSet {
  p1: number;
  p2: number;
  /** tiebreak points if the set went to a tiebreak */
  tb?: [number | null, number | null];
}

export type MatchStatus = "live" | "finished" | "upcoming" | "cancelled";

export interface MatchPlayer {
  name: string;
  key: string;
  countryCode: string | null;
  flag: string;
}

export interface MatchStats {
  aces?: [number, number];
  doubleFaults?: [number, number];
  firstServePct?: [number, number];
  firstServeWon?: [number, number];
  secondServeWon?: [number, number];
  winners?: [number, number];
  unforcedErrors?: [number, number];
  /** break points converted, as "won/total" pairs per player */
  breakPoints?: [string, string];
  breakPointsSaved?: [string, string];
  totalPointsWon?: [number, number];
}

export interface LiveMatch {
  id: string;
  tournament: string;
  tournamentKey: string;
  /** raw API event type, e.g. "Atp Singles" */
  eventType: string;
  tour: Tour;
  isDoubles: boolean;
  round: string;
  /** ISO date (YYYY-MM-DD) in Europe/Warsaw */
  date: string;
  /** HH:mm in Europe/Warsaw */
  time: string;
  player1: MatchPlayer;
  player2: MatchPlayer;
  sets: MatchSet[];
  /** current game score, e.g. "40 - 15"; empty when not live */
  currentGame: string;
  server: 1 | 2 | null;
  status: MatchStatus;
  /** human readable status, e.g. "Set 2" */
  statusLabel: string;
  winner: 1 | 2 | null;
  stats: MatchStats | null;
  /** from the API tournament index or the calendar tournament */
  surface?: Surface;
  /** qualifying draw (tournament name carries "- Qualification") */
  isQualifying: boolean;
  /** sets won, e.g. "2 - 1"; empty before the match starts */
  finalResult: string;
}

// ─── Tournaments (calendar) ──────────────────────────────────────────────────

export interface PastWinner {
  year: number;
  name: string;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  country: string;
  countryCode?: string | null;
  flag: string;
  surface: Surface;
  category: TournamentCategory;
  startDate: string;
  endDate: string;
  prize?: string;
  status: TournamentStatus;
  currentChampion?: string;
  pastWinners?: PastWinner[];
  imageUrl?: string | null;
  imageCredit?: string | null;
  website?: string | null;
  liveStreamUrl?: string | null;
  apiTournamentKey?: string | null;
  description?: string | null;
}

// ─── Presentation maps ───────────────────────────────────────────────────────

export const surfaceLabels: Record<Surface, string> = {
  Hard: "Twarda",
  Clay: "Mączka",
  Grass: "Trawa",
  "Indoor Hard": "Hala",
};

/** Tailwind classes for surface chips */
export const surfaceColors: Record<Surface, string> = {
  Clay: "bg-orange-50 text-orange-800 border-orange-200",
  Grass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Hard: "bg-sky-50 text-sky-800 border-sky-200",
  "Indoor Hard": "bg-violet-50 text-violet-800 border-violet-200",
};

/** Solid colours for dots / bars */
export const surfaceDotColors: Record<Surface, string> = {
  Clay: "#c2410c",
  Grass: "#15803d",
  Hard: "#0369a1",
  "Indoor Hard": "#6d28d9",
};

export const categoryColors: Record<TournamentCategory, string> = {
  "Grand Slam": "bg-amber-50 text-amber-900 border-amber-300",
  "ATP Finals": "bg-indigo-50 text-indigo-900 border-indigo-300",
  "WTA Finals": "bg-fuchsia-50 text-fuchsia-900 border-fuchsia-300",
  "ATP 1000": "bg-indigo-50 text-indigo-800 border-indigo-200",
  "ATP 500": "bg-sky-50 text-sky-800 border-sky-200",
  "ATP 250": "bg-slate-50 text-slate-700 border-slate-200",
  "WTA 1000": "bg-pink-50 text-pink-800 border-pink-200",
  "WTA 500": "bg-rose-50 text-rose-800 border-rose-200",
  "WTA 250": "bg-slate-50 text-slate-700 border-slate-200",
  Inne: "bg-slate-50 text-slate-700 border-slate-200",
};

export const matchStatusLabels: Record<MatchStatus, string> = {
  live: "Na żywo",
  finished: "Zakończony",
  upcoming: "Nadchodzący",
  cancelled: "Odwołany",
};

export const tourLabels: Record<Tour, string> = {
  ATP: "ATP",
  WTA: "WTA",
  Challenger: "Challenger",
  ITF: "ITF",
  Junior: "Juniorzy",
  Other: "Inne",
};
