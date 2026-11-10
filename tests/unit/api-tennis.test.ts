import { describe, expect, it } from "vitest";
import { hasPlayerFrom, matchTournamentInIndex, qualifyingRound, toPlayerProfile, sortMatches, toMatch, toSurface, tourFromEventType, translateRound, type RawTournament } from "@/lib/api-tennis";
import { countryFromName } from "@/lib/countries";
import { fixture } from "../helpers";

type RawMatch = Parameters<typeof toMatch>[0];
interface Standing { player_key: number | string; country: string }

const live = fixture<{ result: RawMatch[] }>("livescore.json").result;
const day = fixture<{ result: RawMatch[] }>("fixtures-day.json").result;
const index = fixture<{ result: RawTournament[] }>("tournaments-index.json").result;
const standings = [...fixture<{ result: Standing[] }>("standings-atp.json").result, ...fixture<{ result: Standing[] }>("standings-wta.json").result];

const countryIndex = new Map<string, string | null>();
for (const p of standings) countryIndex.set(String(p.player_key), countryFromName(p.country).code);

describe("toMatch (verified against live API samples)", () => {
  it("marks finished matches as finished even though the live feed keeps event_live=1", () => {
    const raw = live.find((m) => m.event_status === "Finished")!;
    expect(raw.event_live).toBe("1");
    const m = toMatch(raw, countryIndex);
    expect(m.status).toBe("finished");
    expect(m.winner).toBe(2);
    expect(m.currentGame).toBe("");
    expect(m.server).toBeNull();
  });

  it("marks 'Set N' matches as live with the set label", () => {
    const raw = live.find((m) => /^Set \d/.test(m.event_status ?? ""))!;
    const m = toMatch(raw, countryIndex);
    expect(m.status).toBe("live");
    expect(m.statusLabel).toMatch(/^Set \d/);
    expect(m.currentGame).toMatch(/^\d+ - \d+$|^$/);
  });

  it("parses set scores with tiebreak points appended ('77' → 7 games, tb 7)", () => {
    const raw = live.find((m) => m.scores?.some((s) => String(s.score_first).length > 1 || String(s.score_second).length > 1))!;
    const m = toMatch(raw, countryIndex);
    const tbSet = m.sets.find((s) => s.tb);
    expect(tbSet).toBeDefined();
    expect(tbSet!.p1).toBeLessThanOrEqual(7);
    expect(tbSet!.p2).toBeLessThanOrEqual(7);
    expect(Math.abs(tbSet!.p1 - tbSet!.p2)).toBe(1);
  });

  it("maps match statistics including ratio stats", () => {
    const raw = live.find((m) => m.statistics && m.statistics.length > 0)!;
    const m = toMatch(raw, countryIndex);
    expect(m.stats).not.toBeNull();
    expect(m.stats!.aces).toHaveLength(2);
    expect(m.stats!.firstServePct![0]).toBeGreaterThan(0);
    expect(m.stats!.breakPoints![0]).toMatch(/^\d+\/\d+$/);
    expect(m.stats!.unforcedErrors![1]).toBeGreaterThan(0);
  });

  it("strips the tournament prefix from rounds and translates them", () => {
    expect(translateRound("ATP Basel - Semi-finals")).toBe("Półfinał");
    expect(translateRound("W35 Bakersfield, CA - 1/8-finals")).toBe("1/8 finału");
    expect(translateRound("WTA Osaka - Final")).toBe("Finał");
    expect(translateRound("Florence - Qualification - 1st round")).toBe("1. runda");
    expect(translateRound("Round of 32")).toBe("1/16 finału");
    expect(translateRound(undefined)).toBe("");
  });

  it("detects qualifiers even when only the round carries the qualification marker", () => {
    const match = toMatch({ ...live[0], tournament_name: "ATP Vienna", tournament_round: "ATP Vienna - Qualification - Final" }, countryIndex);
    expect(match.isQualifying).toBe(true);
    expect(match.round).toBe("Finał kwalifikacji");
  });

  it("detects tours and doubles from event types", () => {
    expect(tourFromEventType("Atp Singles")).toBe("ATP");
    expect(tourFromEventType("Wta Doubles")).toBe("WTA");
    expect(tourFromEventType("Challenger Men Singles")).toBe("Challenger");
    expect(tourFromEventType("Itf Women Singles")).toBe("ITF");
    expect(tourFromEventType("Boys Singles")).toBe("Junior");
    const doubles = live.find((m) => /double/i.test(m.event_type_type ?? ""));
    if (doubles) expect(toMatch(doubles, countryIndex).isDoubles).toBe(true);
  });

  it("resolves flags for ranked ATP/WTA players", () => {
    const tour = live.filter((m) => /^(atp|wta) singles/i.test(m.event_type_type ?? "")).map((m) => toMatch(m, countryIndex));
    expect(tour.length).toBeGreaterThan(0);
    const withFlags = tour.filter((m) => m.player1.flag && m.player2.flag);
    expect(withFlags.length / tour.length).toBeGreaterThanOrEqual(0.5);
  });

  it("covers every status in a day of fixtures", () => {
    const mapped = day.map((m) => toMatch(m, countryIndex));
    const statuses = new Set(mapped.map((m) => m.status));
    expect(statuses.has("finished")).toBe(true);
    expect(statuses.has("upcoming")).toBe(true);
    for (const m of mapped) {
      expect(["live", "finished", "upcoming", "cancelled"]).toContain(m.status);
      expect(m.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    const walkover = day.find((m) => /walk/i.test(m.event_status ?? ""));
    if (walkover) expect(toMatch(walkover, countryIndex)).toMatchObject({ status: "finished", statusLabel: "Walkower" });
    const cancelled = day.find((m) => /cancel/i.test(m.event_status ?? ""));
    if (cancelled) expect(toMatch(cancelled, countryIndex).status).toBe("cancelled");
  });

  it("sorts live first, then upcoming, then finished; ATP/WTA before ITF", () => {
    const sorted = sortMatches(day.map((m) => toMatch(m, countryIndex)));
    const order = { live: 0, upcoming: 1, finished: 2, cancelled: 3 };
    for (let i = 1; i < sorted.length; i++) {
      expect(order[sorted[i].status]).toBeGreaterThanOrEqual(order[sorted[i - 1].status]);
    }
  });
});

describe("calendar ↔ API-Tennis matching", () => {
  const cases: Array<{ name: string; location: string; category: string; surface: string; expectAtp?: string; expectWta?: string }> = [
    { name: "Wimbledon 2026", location: "Londyn", category: "Grand Slam", surface: "Grass", expectAtp: "Wimbledon", expectWta: "Wimbledon" },
    { name: "cinch Championships — Queen's Club", location: "Londyn", category: "ATP 500", surface: "Grass", expectAtp: "London" },
    { name: "Roland Garros 2026", location: "Paryż", category: "Grand Slam", surface: "Clay", expectAtp: "French Open", expectWta: "French Open" },
    { name: "Rolex Paris Masters", location: "Paryż", category: "ATP 1000", surface: "Indoor Hard", expectAtp: "Paris" },
    { name: "Swiss Indoors — Bazylea", location: "Bazylea", category: "ATP 500", surface: "Indoor Hard", expectAtp: "Basel" },
    { name: "Erste Bank Open — Wiedeń", location: "Wiedeń", category: "ATP 500", surface: "Indoor Hard", expectAtp: "Vienna" },
    { name: "Australian Open 2026", location: "Melbourne", category: "Grand Slam", surface: "Hard", expectAtp: "Australian Open" },
    { name: "Nitto ATP Finals", location: "Turyn", category: "ATP Finals", surface: "Indoor Hard", expectAtp: "Finals - Turin" },
    { name: "WTA Finals", location: "Rijad", category: "WTA Finals", surface: "Indoor Hard", expectWta: "Finals - Riyadh" },
    { name: "China Open — Pekin", location: "Pekin", category: "WTA 1000", surface: "Hard", expectWta: "Beijing" },
  ];

  for (const c of cases) {
    it(`matches "${c.name}"`, () => {
      const res = matchTournamentInIndex(c as never, index);
      expect(res.length).toBeGreaterThan(0);
      const atp = res.find((r) => /^atp/i.test(r.eventType) && !/qualif/i.test(r.name));
      const wta = res.find((r) => /^wta/i.test(r.eventType) && !/qualif/i.test(r.name));
      if (c.expectAtp) expect(atp?.name.replace(/^ATP\s+/, "")).toBe(c.expectAtp);
      if (c.expectWta) expect(wta?.name.replace(/^WTA\s+/, "")).toBe(c.expectWta);
    });
  }

  it("maps index surfaces", () => {
    expect(toSurface("Clay")).toBe("Clay");
    expect(toSurface("Indoor Hard")).toBe("Indoor Hard");
    expect(toSurface("Grass")).toBe("Grass");
    expect(toSurface(null)).toBeUndefined();
  });
});

describe("hasPlayerFrom (homepage box with Polish players)", () => {
  const [keyA, codeA] = [...countryIndex.entries()].find(([, c]) => c)!;
  const [keyB] = [...countryIndex.entries()].find(([k, c]) => c === codeA && k !== keyA)!;
  const [keyOther] = [...countryIndex.entries()].find(([, c]) => c && c !== codeA)!;

  it("finds a singles match by either player's country", () => {
    expect(hasPlayerFrom({ event_key: 1, first_player_key: "0", second_player_key: keyA }, codeA!, countryIndex)).toBe(true);
    expect(hasPlayerFrom({ event_key: 1, first_player_key: keyOther, second_player_key: "0" }, codeA!, countryIndex)).toBe(false);
  });

  it("checks doubles partners, whose pair key is not in the rankings", () => {
    const raw = { event_key: 2, first_player_key: "pair-1", first_player_dp1_key: keyOther, first_player_dp2_key: keyA, second_player_key: "pair-2" };
    expect(hasPlayerFrom(raw, codeA!, countryIndex)).toBe(true);
  });

  it("gives a doubles pair a flag only when both partners share a country", () => {
    const same = toMatch({ event_key: 3, event_type_type: "Wta Doubles", first_player_key: "pair-1", first_player_dp1_key: keyA, first_player_dp2_key: keyB, second_player_key: "pair-2", second_player_dp1_key: keyA, second_player_dp2_key: keyOther }, countryIndex);
    expect(same.player1.countryCode).toBe(codeA);
    expect(same.player2.countryCode).toBeNull();
  });
});

describe("toPlayerProfile (get_players)", () => {
  const raw = {
    player_key: 1910,
    player_name: "I. Swiatek",
    player_country: "Poland",
    player_bday: "31.05.2001",
    stats: [
      { season: "2025", type: "singles", rank: "2", titles: "3", matches_won: "64", matches_lost: "17", hard_won: "40", hard_lost: "10" },
      { season: "2025", type: "singles", rank: "", titles: "0", matches_won: "0", matches_lost: "0" },
      { season: "2024", type: "doubles", rank: "41", matches_won: "5", matches_lost: "2" },
      { season: "1", type: "singles", rank: "", matches_won: "3", matches_lost: "1" },
    ],
    tournaments: [
      { name: "Wimbledon", season: "2025", type: "singles", surface: "grass" },
      { name: "Doha", season: "2024", type: "doubles", surface: "hard" },
    ],
  };

  it("keeps one row per real season (the fuller duplicate), singles only", () => {
    const p = toPlayerProfile(raw);
    expect(p.singles).toHaveLength(1);
    expect(p.singles[0]).toMatchObject({ season: 2025, rank: 2, won: 64, lost: 17, titles: 3, hard: [40, 10] });
  });

  it("parses birth date, country and singles titles", () => {
    const p = toPlayerProfile(raw);
    expect(p.birthDate).toBe("2001-05-31");
    expect(p.countryCode).toBe("PL");
    expect(p.singlesTitles).toEqual([{ name: "Wimbledon", season: 2025, surface: "Grass" }]);
  });

  it("treats the feed's 01.01.1970 placeholder as an unknown birth date", () => {
    expect(toPlayerProfile({ ...raw, player_bday: "01.01.1970" }).birthDate).toBeNull();
  });
});

describe("qualifying draws (same tournament key and round names as the main draw)", () => {
  it("uses event_qualification to label qualifying rounds", () => {
    const q = day.find((m) => m.event_qualification === "True" && /Semi-finals$/.test(m.tournament_round ?? ""))!;
    const m = toMatch(q, countryIndex);
    expect(m.isQualifying).toBe(true);
    expect(m.round).toBe("Półfinał kwalifikacji");
  });

  it("leaves main-draw rounds untouched", () => {
    const main = day.find((m) => m.event_qualification === "False" && !/qualif/i.test(`${m.tournament_name} ${m.tournament_round}`))!;
    const m = toMatch(main, countryIndex);
    expect(m.isQualifying).toBe(false);
    expect(m.round).not.toMatch(/kwalifikac/i);
  });

  it("does not double the label", () => {
    expect(qualifyingRound("Finał")).toBe("Finał kwalifikacji");
    expect(qualifyingRound("Kwalifikacje, 2. runda")).toBe("Kwalifikacje, 2. runda");
    expect(qualifyingRound("")).toBe("Kwalifikacje");
  });
});
