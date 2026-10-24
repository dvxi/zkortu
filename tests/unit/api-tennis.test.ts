import { describe, expect, it } from "vitest";
import { matchTournamentInIndex, sortMatches, toMatch, toSurface, tourFromEventType, translateRound, type RawTournament } from "@/lib/api-tennis";
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
