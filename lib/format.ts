// ─── Polish date / number formatting helpers ─────────────────────────────────

const TZ = "Europe/Warsaw";

/** Parse "YYYY-MM-DD" as local noon to avoid timezone day-shifts. */
export function parseIsoDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00`);
}

/** Today's date as "YYYY-MM-DD" in Europe/Warsaw. */
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }): string {
  if (!iso) return "";
  return parseIsoDate(iso).toLocaleDateString("pl-PL", opts);
}

export function formatDateShort(iso: string): string {
  return formatDate(iso, { day: "numeric", month: "short" });
}

export function formatDateTime(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pl-PL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

/** "12 – 25 stycznia 2026" or "28 kwietnia – 10 maja 2026" */
export function formatDateRange(start: string, end: string): string {
  if (!start) return "Termin do ogłoszenia";
  if (!end) return formatDate(start);
  const s = parseIsoDate(start);
  const e = parseIsoDate(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()} – ${e.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}`;
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  const left = s.toLocaleDateString("pl-PL", sameYear ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" });
  const right = e.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
  return `${left} – ${right}`;
}

export function formatPoints(n: number): string {
  return n.toLocaleString("pl-PL");
}

/** Relative label: "przed chwilą", "5 min temu", "3 godz. temu", "2 dni temu" */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "przed chwilą";
  if (m < 60) return `${m} min temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} godz. temu`;
  const d = Math.floor(h / 24);
  if (d === 1) return "wczoraj";
  if (d < 30) return `${d} dni temu`;
  return formatDate(iso.slice(0, 10));
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pluralPl(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
