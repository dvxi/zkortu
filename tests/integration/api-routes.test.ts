/**
 * Integration tests against a running server (BASE_URL, default http://localhost:3000).
 * They exercise the real API-Tennis and Sanity integrations through our routes.
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { LiveMatch, Player, Tournament } from "@/lib/types";
import { BASE_URL, getJson, hasApiKey, hasSanityToken, sanityMutate, sanityQuery, serverUp, todayWarsaw } from "../helpers";

let up = false;
beforeAll(async () => {
  up = await serverUp();
});

const needsServer = (fn: () => Promise<void>) => async () => {
  if (!up) throw new Error(`Server not reachable at ${BASE_URL}. Start it with: npm run dev`);
  await fn();
};

describe("GET /api/rankings", () => {
  it.runIf(hasApiKey())("returns the full ATP list with flags and points", needsServer(async () => {
    const { status, body } = await getJson<{ players: Player[]; count: number }>(`${BASE_URL}/api/rankings?tour=ATP`);
    expect(status).toBe(200);
    expect(body.count).toBeGreaterThan(500);
    expect(body.players[0]).toMatchObject({ rank: 1 });
    expect(body.players[0].name.length).toBeGreaterThan(3);
    expect(body.players[0].points).toBeGreaterThan(5000);
    const top100 = body.players.slice(0, 100);
    const flagged = top100.filter((p) => p.countryCode && p.flag !== "🏳️").length;
    expect(flagged, "top 100 players with a resolved flag").toBeGreaterThanOrEqual(90);
    for (let i = 1; i < 50; i++) expect(body.players[i].rank).toBeGreaterThanOrEqual(body.players[i - 1].rank);
    expect(body.players.some((p) => p.countryCode === "PL"), "a Polish player exists").toBe(true);
  }));

  it.runIf(hasApiKey())("returns the WTA list", needsServer(async () => {
    const { status, body } = await getJson<{ players: Player[] }>(`${BASE_URL}/api/rankings?tour=WTA`);
    expect(status).toBe(200);
    expect(body.players.length).toBeGreaterThan(500);
    expect(body.players.find((p) => /Swiatek|Świątek/.test(p.name))).toBeDefined();
  }));
});

describe("GET /api/livescores and /api/matches", () => {
  it.runIf(hasApiKey())("returns well-formed live matches limited to ATP/WTA by default", needsServer(async () => {
    const { status, body } = await getJson<{ matches: LiveMatch[] }>(`${BASE_URL}/api/livescores`);
    expect(status).toBe(200);
    for (const m of body.matches) {
      expect(["ATP", "WTA"]).toContain(m.tour);
      expect(["live", "finished", "upcoming", "cancelled"]).toContain(m.status);
      expect(m.player1.name).not.toBe("—");
      expect(m.player2.name).not.toBe("—");
      for (const s of m.sets) {
        expect(s.p1).toBeLessThanOrEqual(13);
        expect(s.p2).toBeLessThanOrEqual(13);
      }
      if (m.status === "live") expect(m.statusLabel).toMatch(/Set \d|Na żywo/);
    }
  }));

  it.runIf(hasApiKey())("scope=all includes lower tiers and is a superset", needsServer(async () => {
    const [tour, all] = await Promise.all([
      getJson<{ matches: LiveMatch[] }>(`${BASE_URL}/api/livescores?scope=tour`),
      getJson<{ matches: LiveMatch[] }>(`${BASE_URL}/api/livescores?scope=all`),
    ]);
    expect(all.body.matches.length).toBeGreaterThanOrEqual(tour.body.matches.length);
    const tourIds = new Set(tour.body.matches.map((m) => m.id));
    for (const id of tourIds) expect(all.body.matches.some((m) => m.id === id)).toBe(true);
  }));

  it.runIf(hasApiKey())("returns today's ATP/WTA schedule with dates equal to the requested day", needsServer(async () => {
    const today = todayWarsaw();
    const { status, body } = await getJson<{ matches: LiveMatch[]; date: string }>(`${BASE_URL}/api/matches?date=${today}&scope=tour`);
    expect(status).toBe(200);
    expect(body.date).toBe(today);
    expect(body.matches.length).toBeGreaterThan(0);
    for (const m of body.matches) {
      expect(m.date).toBe(today);
      expect(["ATP", "WTA"]).toContain(m.tour);
    }
  }));

  it("rejects malformed dates", needsServer(async () => {
    const { status } = await getJson(`${BASE_URL}/api/matches?date=tomorrow`);
    expect(status).toBe(400);
  }));
});

describe("GET /api/calendar and tournament matches", () => {
  let tournaments: Tournament[] = [];

  it("returns the curated season with computed statuses and sane dates", needsServer(async () => {
    const { status, body } = await getJson<{ tournaments: Tournament[]; count: number }>(`${BASE_URL}/api/calendar`);
    expect(status).toBe(200);
    tournaments = body.tournaments;
    expect(body.count).toBeGreaterThanOrEqual(50);
    const today = todayWarsaw();
    for (const t of tournaments) {
      expect(t.startDate <= t.endDate, `${t.name} dates ordered`).toBe(true);
      const expected = t.endDate < today ? "completed" : t.startDate <= today ? "live" : "upcoming";
      expect(t.status, `${t.name} status`).toBe(expected);
      expect(t.name.length).toBeGreaterThan(2);
      expect(["Hard", "Clay", "Grass", "Indoor Hard"]).toContain(t.surface);
    }
    expect(tournaments.some((t) => t.category === "Grand Slam")).toBe(true);
  }));

  it.runIf(hasApiKey())("enriches a live or recent tournament with API-Tennis matches inside its date window", needsServer(async () => {
    const today = todayWarsaw();
    const candidates = tournaments
      .filter((t) => t.status === "live" || (t.status === "completed" && t.endDate >= new Date(Date.now() - 21 * 86_400_000).toISOString().slice(0, 10)))
      .filter((t) => t.category.startsWith("ATP") || t.category.startsWith("WTA"))
      .slice(0, 3);
    expect(candidates.length, "need at least one current tournament in the calendar").toBeGreaterThan(0);
    for (const t of candidates) {
      const { status, body } = await getJson<{ matches: LiveMatch[]; error?: string }>(`${BASE_URL}/api/tournaments/${encodeURIComponent(t.id)}/matches`);
      expect(status, `${t.name}: ${body.error ?? ""}`).toBe(200);
      expect(body.matches.length, `${t.name} has matches`).toBeGreaterThan(0);
      const lo = new Date(new Date(t.startDate).getTime() - 4 * 86_400_000).toISOString().slice(0, 10);
      const hi = new Date(new Date(t.endDate).getTime() + 1 * 86_400_000).toISOString().slice(0, 10);
      for (const m of body.matches) {
        expect(m.date >= lo && m.date <= hi, `${t.name}: match ${m.player1.name} vs ${m.player2.name} on ${m.date} within ${lo}..${hi}`).toBe(true);
        expect(m.isDoubles).toBe(false);
      }
      if (t.status === "live") {
        expect(body.matches.some((m) => m.date <= today), `${t.name} live tournament has played matches`).toBe(true);
      }
    }
  }));

  it("returns 404 for unknown tournaments", needsServer(async () => {
    const { status } = await getJson(`${BASE_URL}/api/tournaments/does-not-exist/matches`);
    expect(status).toBe(404);
  }));
});

describe("comments", () => {
  const slugPromise = sanityQuery<string | null>(`*[_type == "article" && defined(slug.current)][0].slug.current`);

  it("hides comments for unknown articles", needsServer(async () => {
    const { status } = await getJson(`${BASE_URL}/api/comments?article=no-such-article`);
    expect(status).toBe(404);
  }));

  it.runIf(hasSanityToken())("stores a new comment as pending, hides it until approved, then shows it", needsServer(async () => {
    const slug = await slugPromise;
    expect(slug, "an article exists in Sanity").toBeTruthy();
    const marker = `vitest-${Date.now()}`;
    const post = async (extra: Record<string, unknown>) =>
      getJson<{ ok?: boolean; pending?: boolean; error?: string }>(`${BASE_URL}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: slug, name: "Test Vitest", body: `Komentarz testowy ${marker}`, website: "", startedAt: Date.now() - 10_000, ...extra }),
      });

    // timing guard
    const fast = await post({ startedAt: Date.now() });
    expect(fast.status).toBe(429);

    // honeypot: pretends success, writes nothing
    const bot = await post({ website: "http://spam.example" });
    expect(bot.status).toBe(200);

    // valid
    const ok = await post({});
    expect(ok.status, JSON.stringify(ok.body)).toBe(201);
    expect(ok.body.pending).toBe(true);

    const created = await sanityQuery<Array<{ _id: string; approved: boolean }>>(`*[_type == "comment" && body match $marker]{_id, approved}`, { marker: `*${marker}*` });
    expect(created).toHaveLength(1);
    expect(created[0].approved).toBe(false);

    try {
      const hidden = await getJson<{ comments: Array<{ body: string }> }>(`${BASE_URL}/api/comments?article=${slug}`);
      expect(hidden.body.comments.some((c) => c.body.includes(marker))).toBe(false);

      await sanityMutate([{ patch: { id: created[0]._id, set: { approved: true } } }]);
      const shown = await getJson<{ comments: Array<{ body: string; authorName: string }> }>(`${BASE_URL}/api/comments?article=${slug}`);
      const mine = shown.body.comments.find((c) => c.body.includes(marker));
      expect(mine).toBeDefined();
      expect(mine!.authorName).toBe("Test Vitest");
    } finally {
      await sanityMutate([{ delete: { id: created[0]._id } }]);
    }
  }));

  it("validates input", needsServer(async () => {
    const slug = await slugPromise;
    const { status, body } = await getJson<{ error?: string }>(`${BASE_URL}/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article: slug, name: "A", body: "x", startedAt: Date.now() - 10_000 }),
    });
    expect(status).toBe(422);
    expect(body.error).toMatch(/Podpis/);
  }));
});

describe("contact form", () => {
  it("validates and never sends on bad input", needsServer(async () => {
    const { status, body } = await getJson<{ error?: string }>(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", email: "x", subject: "general", message: "za krótko" }),
    });
    expect(status).toBe(422);
    expect(body.error).toBeTruthy();
  }));

  it("silently accepts honeypot submissions without sending", needsServer(async () => {
    const { status, body } = await getJson<{ ok?: boolean }>(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bot", email: "bot@example.com", subject: "general", message: "spam spam spam spam", website: "http://spam.example", startedAt: 1 }),
    });
    expect(status).toBe(200);
    expect(body.ok).toBe(true);
  }));

  it("reports a clear 503 when Resend is not configured locally", needsServer(async () => {
    const key = process.env.RESEND_API_KEY;
    if (key && key !== "[SENSITIVE]") return; // configured: covered by the manual production check
    const { status, body } = await getJson<{ error?: string }>(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", email: "test@example.com", subject: "general", message: "Wiadomość testowa z testów integracyjnych.", startedAt: Date.now() - 10_000 }),
    });
    expect(status).toBe(503);
    expect(body.error).toMatch(/niedostępna/);
  }));
});

describe("pages render", () => {
  for (const path of ["/", "/aktualnosci", "/wyniki-live", "/ranking", "/kalendarz", "/wideo", "/kontakt", "/sitemap.xml", "/robots.txt"]) {
    it(`GET ${path} → 200`, needsServer(async () => {
      const res = await fetch(`${BASE_URL}${path}`, { signal: AbortSignal.timeout(90_000) });
      expect(res.status).toBe(200);
    }));
  }
  it("redirects the hidden junior section and 404s unknown pages", needsServer(async () => {
    const r = await fetch(`${BASE_URL}/tenis-juniorski`, { redirect: "manual" });
    expect([307, 308]).toContain(r.status);
    const nf = await fetch(`${BASE_URL}/aktualnosci/nie-ma-takiego-artykulu`);
    expect(nf.status).toBe(404);
  }));
});
