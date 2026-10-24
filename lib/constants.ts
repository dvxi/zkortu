// ─── Site-wide constants shared by the app and the Sanity schema ─────────────

export const SITE_NAME = "zkortu.pl";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zkortu.pl";
export const SITE_DESCRIPTION =
  "Portal tenisowy zkortu.pl: wyniki na żywo, rankingi ATP i WTA, aktualności, kalendarz turniejów i wideo.";

export const ARTICLE_CATEGORIES = [
  "ATP",
  "WTA",
  "Roland Garros",
  "Wimbledon",
  "Australian Open",
  "US Open",
  "Transfer",
  "Polska",
  "Juniorzy",
  "Inne",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const VIDEO_CATEGORIES = [
  { value: "Highlights", label: "Skróty" },
  { value: "Full Match", label: "Cały mecz" },
  { value: "Interview", label: "Wywiad" },
  { value: "Analysis", label: "Analiza" },
] as const;

export function videoCategoryLabel(value: string | undefined): string {
  return VIDEO_CATEGORIES.find((c) => c.value === value)?.label ?? value ?? "";
}

export const NAV_LINKS = [
  { href: "/", label: "Strona główna" },
  { href: "/aktualnosci", label: "Aktualności" },
  { href: "/wyniki-live", label: "Wyniki live", live: true },
  { href: "/ranking", label: "Ranking" },
  { href: "/kalendarz", label: "Kalendarz" },
  { href: "/wideo", label: "Wideo" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export const COMMENT_LIMITS = {
  nameMin: 2,
  nameMax: 60,
  bodyMin: 3,
  bodyMax: 1200,
  /** max comments per IP hash in the rate window */
  perWindow: 5,
  windowMinutes: 10,
} as const;
