import { describe, expect, it } from "vitest";
import { mergePlayerStats, summarizeSeason } from "@/lib/api-tennis";
import { isMainTourTitle, tournamentNamePl } from "@/lib/tournament-names";
import type { LiveMatch, PlayerApiProfile } from "@/lib/types";

const KEY = "1434";
const player = (key: string, name = "X") => ({ key, name, countryCode: null, flag: "" });
function match(p: Partial<LiveMatch> & { date: string; round: string; winner: 1 | 2 }): LiveMatch {
  return {
    id: `${p.date}-${p.round}`, tournament: "Wuhan", tournamentKey: "1", eventType: "Wta Singles", tour: "WTA", isDoubles: false, isQualifying: false,
    time: "12:00", player1: player(KEY), player2: player("999"), sets: [], currentGame: "", server: null, status: "finished", statusLabel: "Zakończony",
    stats: null, surface: "Hard", finalResult: "2 - 0", ...p,
  } as LiveMatch;
}

describe("tournament names", () => {
  it("translates cities that have a Polish name and keeps the rest", () => {
    expect(tournamentNamePl("Rome")).toBe("Rzym");
    expect(tournamentNamePl("Finals - Turin")).toBe("Finals - Turyn");
    expect(tournamentNamePl("Mexico City")).toBe("Meksyk");
    expect(tournamentNamePl("French Open")).toBe("Roland Garros");
    expect(tournamentNamePl("Indian Wells")).toBe("Indian Wells");
    expect(tournamentNamePl("Rzym")).toBe("Rzym");
    expect(tournamentNamePl("ATP Indian Wells")).toBe("Indian Wells");
    expect(tournamentNamePl("WTA Rome")).toBe("Rzym");
    expect(tournamentNamePl("ATP Finals")).toBe("ATP Finals");
  });

  it("keeps Grand Slams, 250-1000 and finals; drops ITF, Challenger/125 and the Olympics", () => {
    for (const ok of ["Wimbledon", "Wuhan", "Finals - Turin", "Adelaide 2", "US Open"]) expect(isMainTourTitle(ok)).toBe(true);
    for (const no of ["Montreux (Challenger)", "W75 Montpellier (ITF)", "W60 Prague (ITF)", "M25 Poznan", "Warsaw (ITF)", "Olympic Games", "Next Gen Finals - Milan"]) expect(isMainTourTitle(no)).toBe(false);
  });
});

describe("summarizeSeason (current season from matches)", () => {
  const matches = [
    match({ date: "2026-10-12", round: "Ćwierćfinał", winner: 1 }),
    match({ date: "2026-10-18", round: "Finał", winner: 1 }),
    match({ date: "2026-09-01", round: "1. runda", winner: 2, surface: "Clay" }),
    match({ date: "2026-08-01", round: "Finał", winner: 1, isQualifying: true }),
    match({ date: "2026-07-01", round: "Finał", winner: 1, tour: "Challenger" }),
    match({ date: "2026-06-01", round: "1/8 finału", winner: 1, statusLabel: "Walkower" }),
    match({ date: "2025-12-01", round: "Finał", winner: 1 }),
  ];
  it("counts main-draw tour matches only and finals won as titles", () => {
    const { season, titles } = summarizeSeason(matches, KEY, 2026);
    expect(season).toMatchObject({ season: 2026, won: 2, lost: 1, titles: 1, hard: [2, 0], clay: [0, 1] });
    expect(titles).toEqual([{ name: "Wuhan", season: 2026, surface: "Hard" }]);
  });
});

describe("mergePlayerStats", () => {
  const api: PlayerApiProfile = {
    key: KEY, name: "M. Chwalinska", fullName: "Maja Chwalinska", countryCode: "PL", birthDate: null,
    singles: [{ season: 2025, rank: 40, titles: 3, won: 30, lost: 20, hard: [0, 0], clay: [0, 0], grass: [0, 0] }],
    singlesTitles: [{ name: "Rome", season: 2025 }],
  };
  const current = { season: { season: 2026, rank: null, titles: 1, won: 33, lost: 17, hard: [0, 0] as [number, number], clay: [0, 0] as [number, number], grass: [0, 0] as [number, number] }, titles: [{ name: "Wuhan", season: 2026 }] };

  it("adds the missing current season and its titles; title counts follow the list", () => {
    const { seasons, titles } = mergePlayerStats(api, current, 12);
    expect(seasons.map((s) => [s.season, s.rank, s.titles])).toEqual([[2026, 12, 1], [2025, 40, 1]]);
    expect(titles.map((t) => t.name)).toEqual(["Wuhan", "Rome"]);
  });

  it("does not duplicate a title once the API lists it", () => {
    const withApi = { ...api, singlesTitles: [{ name: "Wuhan", season: 2026 }, ...api.singlesTitles] };
    expect(mergePlayerStats(withApi, current, 12).titles).toHaveLength(2);
  });
});
