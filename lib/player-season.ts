import { unstable_cache } from "next/cache";
import { fetchPlayerSeasonMatches, summarizeSeason } from "./api-tennis";
import type { PlayerSeason, PlayerTitle } from "./types";

/**
 * Current-season record and titles from the player's matches, cached 6 h in the
 * shared data cache (only the small summary is stored, not the multi-MB fixtures).
 */
export const getPlayerSeasonSummary = unstable_cache(
  async (playerKey: string, today: string): Promise<{ season: PlayerSeason; titles: PlayerTitle[] }> =>
    summarizeSeason(await fetchPlayerSeasonMatches(playerKey, today), playerKey, Number(today.slice(0, 4))),
  ["player-season-summary"],
  { revalidate: 21600, tags: ["player-season"] },
);
