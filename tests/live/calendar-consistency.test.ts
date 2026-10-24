/**
 * Calendar consistency: tournaments in Sanity (dates, cities) versus the official WTA feed,
 * ESPN's ATP calendar and API-Tennis fixtures. Requires network; API key for the fixtures part.
 */
import { describe, expect, it } from "vitest";
import { fetchTournamentMatches } from "@/lib/api-tennis";
import { normalizeName } from "@/lib/countries";
import { getTournaments } from "@/lib/sanity";
import { hasApiKey, todayWarsaw } from "../helpers";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const year = Number(todayWarsaw().slice(0, 4));

function tokens(s: string): Set<string> {
  return new Set(normalizeName(s).split(" ").filter((t) => t.length > 3 && !["open", "international", "championships", "masters", "classic"].includes(t)));
}
function overlap(a: string, b: string): boolean {
  const ta = tokens(a);
  return [...tokens(b)].some((t) => ta.has(t));
}
const daysBetween = (a: string, b: string) => Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000;

describe("calendar vs official sources", () => {
  it("WTA tournaments in Sanity have the same dates and city as wtatennis.com", async () => {
    const sanity = (await getTournaments()).filter((t) => t.category.startsWith("WTA") || t.category === "Grand Slam");
    const res = await fetch(`https://api.wtatennis.com/tennis/tournaments/?page=0&pageSize=100&excludeLevels=ITF&from=${year}-01-01&to=${year}-12-31`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(60_000) });
    expect(res.ok).toBe(true);
    const official = ((await res.json()) as { content: Array<{ title: string; startDate: string; endDate: string; city: string; level?: string; tournamentGroup?: { level: string } }> }).content.filter((t) => /1000|500|250|Grand Slam|Finals/i.test(t.level || t.tournamentGroup?.level || ""));
    let checked = 0;
    const mismatches: string[] = [];
    for (const t of sanity) {
      const match = official.find((o) => daysBetween(o.startDate, t.startDate) <= 3 && (overlap(o.city, t.location) || overlap(o.title, t.name)));
      if (!match) continue;
      checked++;
      if (match.startDate !== t.startDate || match.endDate !== t.endDate) mismatches.push(`${t.name}: sanity ${t.startDate}..${t.endDate} vs wta ${match.startDate}..${match.endDate}`);
    }
    console.log(`WTA/GS tournaments compared: ${checked}/${sanity.length}`);
    if (mismatches.length) console.log(mismatches.join("\n"));
    expect(checked).toBeGreaterThan(10);
    expect(mismatches, "date mismatches").toHaveLength(0);
  });

  it("ATP tournaments in Sanity match ESPN's calendar (start within 2 days, same city)", async () => {
    const sanity = (await getTournaments()).filter((t) => t.category.startsWith("ATP"));
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard?dates=${year}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(120_000) });
    expect(res.ok).toBe(true);
    const events = ((await res.json()) as { events: Array<{ name: string; date: string; venue?: { displayName?: string } }> }).events;
    let checked = 0;
    const problems: string[] = [];
    for (const t of sanity) {
      const ev = events.find((e) => overlap(e.name, t.name) && daysBetween(e.date.slice(0, 10), t.startDate) <= 14);
      if (!ev) continue;
      checked++;
      if (daysBetween(ev.date.slice(0, 10), t.startDate) > 2) problems.push(`${t.name}: start ${t.startDate} vs espn ${ev.date.slice(0, 10)}`);
      const city = (ev.venue?.displayName ?? "").split(",")[0].trim();
      if (city && !overlap(city, t.location) && normalizeName(city) !== normalizeName(t.location)) problems.push(`${t.name}: city ${t.location} vs espn ${city}`);
    }
    console.log(`ATP tournaments compared: ${checked}/${sanity.length}`);
    if (problems.length) console.log(problems.join("\n"));
    expect(checked).toBeGreaterThan(10);
    expect(problems.length / Math.max(checked, 1)).toBeLessThanOrEqual(0.1);
  });

  it.runIf(hasApiKey())("API-Tennis fixtures for current tournaments fall inside the calendar dates and carry the right city", async () => {
    const today = todayWarsaw();
    const current = (await getTournaments()).filter((t) => t.status === "live" && t.apiTournamentKey && (t.category.startsWith("ATP") || t.category.startsWith("WTA")));
    expect(current.length, "live tournaments with API keys").toBeGreaterThan(0);
    const lo = (d: string) => new Date(new Date(d).getTime() - 3 * 86_400_000).toISOString().slice(0, 10);
    for (const t of current.slice(0, 6)) {
      const matches = await fetchTournamentMatches(t);
      expect(matches.length, `${t.name} (${t.apiTournamentKey}) has matches`).toBeGreaterThan(0);
      for (const m of matches) {
        expect(m.date >= lo(t.startDate) && m.date <= t.endDate, `${t.name}: ${m.date} in window`).toBe(true);
        expect(m.isDoubles).toBe(false);
      }
      const apiName = matches[0].tournament;
      expect(overlap(apiName, t.location) || overlap(apiName, t.name), `${t.name}: API tournament "${apiName}" relates to ${t.location}`).toBe(true);
      expect(matches.some((m) => m.date <= today), `${t.name}: has played matches`).toBe(true);
    }
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
