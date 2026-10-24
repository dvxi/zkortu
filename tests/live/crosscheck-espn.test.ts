/**
 * Authenticity check: today's finished ATP/WTA singles results from API-Tennis
 * (the feed behind the ticker and /wyniki-live) are compared with ESPN's public
 * tennis scoreboard, an independent data provider. Requires API_TENNIS_KEY + network.
 */
import { describe, expect, it } from "vitest";
import { fetchLiveScores, fetchMatchesForDay } from "@/lib/api-tennis";
import type { LiveMatch } from "@/lib/types";
import { hasApiKey, playerKey, todayWarsaw } from "../helpers";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

interface EspnResult {
  winner: string;
  loser: string;
  sets: Array<[number, number]>;
  status: string;
  tournament: string;
}

async function espnDay(league: "atp" | "wta", yyyymmdd: string): Promise<EspnResult[]> {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/tennis/${league}/scoreboard?dates=${yyyymmdd}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`ESPN ${league} HTTP ${res.status}`);
  const data = (await res.json()) as {
    events?: Array<{
      name: string;
      groupings?: Array<{ grouping?: { slug?: string }; competitions?: Array<{ status?: { type?: { description?: string; state?: string } }; notes?: Array<{ text?: string }>; competitors?: Array<{ winner?: boolean; athlete?: { displayName?: string } }> }> }>;
    }>;
  };
  const out: EspnResult[] = [];
  for (const ev of data.events ?? []) {
    for (const g of ev.groupings ?? []) {
      if (!/singles/.test(g.grouping?.slug ?? "")) continue;
      for (const c of g.competitions ?? []) {
        const note = c.notes?.[0]?.text ?? "";
        const m = note.match(/^(.+?)\s\([A-Z]{3}\)\sbt\s(.+?)\s\([A-Z]{3}\)\s(.*)$/);
        if (!m) continue;
        // "7-6 (7-5)" / "7-6(5)": tiebreak details in parentheses are not sets
        const sets = Array.from(m[3].replace(/\([^)]*\)/g, " ").matchAll(/(\d+)-(\d+)/g)).map((s) => [Number(s[1]), Number(s[2])] as [number, number]);
        out.push({ winner: m[1], loser: m[2], sets, status: c.status?.type?.description ?? "", tournament: ev.name });
      }
    }
  }
  return out;
}

function winnerFirst(m: LiveMatch): Array<[number, number]> {
  return m.sets.map((s) => (m.winner === 2 ? [s.p2, s.p1] : [s.p1, s.p2]));
}

describe.runIf(hasApiKey())("live results cross-checked with ESPN", () => {
  it("finished ATP/WTA singles of today agree with ESPN set by set", async () => {
    const today = todayWarsaw();
    const ours = (await fetchMatchesForDay(today, "tour")).filter((m) => m.status === "finished" && !m.isDoubles && m.winner && m.sets.length > 0);
    const [atp, wta] = await Promise.all([espnDay("atp", today.replace(/-/g, "")), espnDay("wta", today.replace(/-/g, ""))]);
    const espn = [...atp, ...wta];
    const byWinner = new Map<string, EspnResult[]>();
    for (const r of espn) {
      const k = playerKey(r.winner);
      byWinner.set(k, [...(byWinner.get(k) ?? []), r]);
    }

    let found = 0;
    let agree = 0;
    const disagreements: string[] = [];
    for (const m of ours) {
      const w = m.winner === 2 ? m.player2 : m.player1;
      const l = m.winner === 2 ? m.player1 : m.player2;
      const candidates = (byWinner.get(playerKey(w.name)) ?? []).filter((r) => playerKey(r.loser) === playerKey(l.name));
      if (candidates.length === 0) continue;
      found++;
      const e = candidates[0];
      const mine = winnerFirst(m);
      // compare completed sets (ESPN may omit a retired/unfinished last set)
      const n = Math.min(mine.length, e.sets.length);
      const same = n > 0 && mine.slice(0, n).every((s, i) => s[0] === e.sets[i][0] && s[1] === e.sets[i][1]);
      if (same) agree++;
      else disagreements.push(`${w.name} vs ${l.name}: ours ${mine.map((s) => s.join("-")).join(" ")} | espn ${e.sets.map((s) => s.join("-")).join(" ")}`);
    }

    console.log(`finished matches today: ${ours.length}, matched in ESPN: ${found}, agreeing: ${agree}`);
    if (disagreements.length) console.log("disagreements:\n" + disagreements.join("\n"));

    expect(ours.length, "there are finished matches today").toBeGreaterThan(0);
    expect(found / ours.length, "share of our results found in ESPN").toBeGreaterThanOrEqual(0.6);
    expect(agree / Math.max(found, 1), "share of matched results with identical set scores").toBeGreaterThanOrEqual(0.9);
  });

  it("live ticker feed only contains matches currently in play, with plausible scores", async () => {
    const live = await fetchLiveScores("tour");
    for (const m of live) {
      expect(["live", "finished"]).toContain(m.status);
      if (m.status === "live") {
        expect(m.statusLabel).toMatch(/Set \d|Na żywo/);
        for (const s of m.sets) expect(Math.max(s.p1, s.p2)).toBeLessThanOrEqual(7);
      }
      expect(m.tournament.length).toBeGreaterThan(1);
    }
  });
});
