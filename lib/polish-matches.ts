import { unstable_cache } from "next/cache";
import { fetchMatchesWithCountry } from "./api-tennis";
import { addDaysIso, todayIso } from "./format";
import type { LiveMatch } from "./types";

/**
 * Polish players' matches for one day, cached in the shared data cache for
 * 3 minutes: at most ~480 upstream requests a day however busy the site is.
 */
const cachedPolishMatches = unstable_cache(
  (dateIso: string) => fetchMatchesWithCountry(dateIso, "PL"),
  ["polish-matches"],
  { revalidate: 180, tags: ["polish-matches", "fixtures"] },
);

export interface PolishMatchesDay {
  /** ISO date the matches are for */
  date: string;
  /** true when today has no matches and tomorrow's schedule is shown instead */
  isTomorrow: boolean;
  matches: LiveMatch[];
}

/** Today's matches; tomorrow's when today has none; null when both are empty. */
export async function getPolishMatches(): Promise<PolishMatchesDay | null> {
  const today = todayIso();
  const todayMatches = await cachedPolishMatches(today);
  if (todayMatches.length) return { date: today, isTomorrow: false, matches: todayMatches };
  const tomorrow = addDaysIso(today, 1);
  const tomorrowMatches = await cachedPolishMatches(tomorrow);
  if (tomorrowMatches.length) return { date: tomorrow, isTomorrow: true, matches: tomorrowMatches };
  return null;
}
