// ─── Country helpers ─────────────────────────────────────────────────────────
// API-Tennis returns English country names ("Serbia", "USA", "Great Britain").
// Instead of a hand-maintained map we derive the full ISO 3166-1 list from
// Intl.DisplayNames (available in Node 18+ and all modern browsers) and keep a
// small alias table for the names that differ from the CLDR spelling.

const ALIASES: Record<string, string> = {
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  america: "US",
  uk: "GB",
  "united kingdom": "GB",
  "great britain": "GB",
  britain: "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  russia: "RU",
  "russian federation": "RU",
  "czech republic": "CZ",
  czechia: "CZ",
  "south korea": "KR",
  korea: "KR",
  "korea republic": "KR",
  "republic of korea": "KR",
  "north korea": "KP",
  taiwan: "TW",
  "chinese taipei": "TW",
  taipei: "TW",
  "hong kong": "HK",
  "hong kong china": "HK",
  macau: "MO",
  macao: "MO",
  bosnia: "BA",
  "bosnia and herzegovina": "BA",
  "bosnia & herzegovina": "BA",
  "bosnia herzegovina": "BA",
  macedonia: "MK",
  "north macedonia": "MK",
  moldova: "MD",
  "republic of moldova": "MD",
  iran: "IR",
  syria: "SY",
  vietnam: "VN",
  "viet nam": "VN",
  laos: "LA",
  venezuela: "VE",
  bolivia: "BO",
  tanzania: "TZ",
  "ivory coast": "CI",
  "cote d'ivoire": "CI",
  "cote divoire": "CI",
  brunei: "BN",
  "cape verde": "CV",
  "cabo verde": "CV",
  swaziland: "SZ",
  eswatini: "SZ",
  burma: "MM",
  myanmar: "MM",
  turkey: "TR",
  turkiye: "TR",
  netherlands: "NL",
  "the netherlands": "NL",
  holland: "NL",
  slovakia: "SK",
  "slovak republic": "SK",
  "dominican republic": "DO",
  "trinidad and tobago": "TT",
  "trinidad & tobago": "TT",
  palestine: "PS",
  kosovo: "XK",
  vatican: "VA",
  "vatican city": "VA",
  "st kitts and nevis": "KN",
  "st lucia": "LC",
  "st vincent and the grenadines": "VC",
  uae: "AE",
  "united arab emirates": "AE",
  congo: "CG",
  "dr congo": "CD",
  "democratic republic of congo": "CD",
  "democratic republic of the congo": "CD",
  "republic of congo": "CG",
  "the gambia": "GM",
  gambia: "GM",
  "the bahamas": "BS",
  bahamas: "BS",
  "timor leste": "TL",
  "east timor": "TL",
  micronesia: "FM",
  "sao tome and principe": "ST",
  "saint helena": "SH",
  reunion: "RE",
  curacao: "CW",
  "aland islands": "AX",
  world: "",
  international: "",
  neutral: "",
  "neutral athletes": "",
  unknown: "",
};

/** Lowercase, strip diacritics and punctuation, collapse spaces */
export function normalizeName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'`´]/g, "'")
    .replace(/[^a-z0-9'& ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * ICU still names deprecated codes with their modern successor ("YU" → "Serbia",
 * "FX" → "France", "SU" → "Russia"), and they sort after the real codes, so they
 * must be skipped or they would hijack the name → code index.
 */
const LEGACY_CODES = new Set(["YU", "CS", "SU", "DD", "FX", "ZR", "BU", "TP", "AN", "EU", "EZ", "UN", "QO", "XA", "XB", "ZZ", "QU"]);

let codes: string[] | null = null;
let enToCode: Map<string, string> | null = null;
let plNames: Intl.DisplayNames | null = null;

function ensureIndex() {
  if (codes && enToCode) return;
  const en = new Intl.DisplayNames(["en"], { type: "region", fallback: "code" });
  const list: string[] = [];
  const map = new Map<string, string>();
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a) + String.fromCharCode(b);
      if (LEGACY_CODES.has(code)) continue;
      let name: string | undefined;
      try {
        name = en.of(code);
      } catch {
        continue;
      }
      if (!name || name === code || /unknown region/i.test(name)) continue;
      list.push(code);
      const norm = normalizeName(name);
      map.set(norm, code);
      const noThe = norm.replace(/^the /, "");
      if (!map.has(noThe)) map.set(noThe, code);
      const andForm = norm.replace(/ & /g, " and ");
      if (!map.has(andForm)) map.set(andForm, code);
    }
  }
  for (const [alias, code] of Object.entries(ALIASES)) {
    map.set(normalizeName(alias), code);
  }
  codes = list;
  enToCode = map;
}

/** Regional-indicator flag emoji for an ISO alpha-2 code. */
export function flagFromCode(code: string | null | undefined): string {
  if (!code || code.length !== 2 || code === "XK") return "🏳️";
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    0x1f1e6 + upper.charCodeAt(0) - 65,
    0x1f1e6 + upper.charCodeAt(1) - 65,
  );
}

/** "🇵🇱" → "PL"; returns null for anything that is not a regional-indicator pair. */
export function codeFromFlag(flag: string | null | undefined): string | null {
  if (!flag) return null;
  const points = Array.from(flag).map((c) => c.codePointAt(0) ?? 0);
  if (points.length !== 2 || points.some((p) => p < 0x1f1e6 || p > 0x1f1ff)) return null;
  return String.fromCharCode(points[0] - 0x1f1e6 + 65, points[1] - 0x1f1e6 + 65);
}

/** Polish display name for an ISO alpha-2 code. */
/** Shorter editorial forms where CLDR is too formal ("SRA Hongkong (Chiny)"). */
const PL_NAME_OVERRIDES: Record<string, string> = {
  US: "USA",
  XK: "Kosowo",
  HK: "Hongkong",
  MO: "Makau",
  GB: "Wielka Brytania",
  CZ: "Czechy",
  KR: "Korea Południowa",
  KP: "Korea Północna",
  CD: "DR Konga",
  CG: "Kongo",
};

export function countryNamePl(code: string | null | undefined): string {
  if (!code) return "";
  if (PL_NAME_OVERRIDES[code]) return PL_NAME_OVERRIDES[code];
  try {
    plNames ??= new Intl.DisplayNames(["pl"], { type: "region", fallback: "code" });
    return plNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export interface CountryInfo {
  code: string | null;
  flag: string;
  namePl: string;
  /** the original name as returned by the API */
  raw: string;
}

/** Resolve an English country name (as used by API-Tennis) to code + flag + PL name. */
export function countryFromName(name: string | null | undefined): CountryInfo {
  const raw = (name ?? "").trim();
  if (!raw) return { code: null, flag: "🏳️", namePl: "", raw };
  ensureIndex();
  const norm = normalizeName(raw);
  let code = enToCode!.get(norm);
  if (code === undefined) {
    const stripped = norm.replace(/\s*\(.*\)$/, "").replace(/, the$/, "");
    code = enToCode!.get(stripped);
  }
  if (code === undefined && /^[a-z]{2}$/.test(norm)) {
    code = norm.toUpperCase();
  }
  if (!code) {
    return { code: null, flag: "🏳️", namePl: code === "" ? "Niezrzeszony" : raw, raw };
  }
  return { code, flag: flagFromCode(code), namePl: countryNamePl(code), raw };
}

/** Resolve an ISO alpha-2 code (e.g. from Sanity) to flag + PL name. */
export function countryFromCode(code: string | null | undefined): CountryInfo {
  const c = (code ?? "").trim().toUpperCase();
  if (!c) return { code: null, flag: "🏳️", namePl: "", raw: "" };
  return { code: c, flag: flagFromCode(c), namePl: countryNamePl(c), raw: c };
}

/** All ISO alpha-2 codes known to the runtime (sorted by Polish name). */
export function allCountryOptions(): Array<{ code: string; namePl: string; flag: string }> {
  ensureIndex();
  return codes!
    .map((code) => ({ code, namePl: countryNamePl(code), flag: flagFromCode(code) }))
    .sort((a, b) => a.namePl.localeCompare(b.namePl, "pl"));
}
