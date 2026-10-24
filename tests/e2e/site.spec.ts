import { expect, test, type Page } from "@playwright/test";
import { gotoReady } from "./utils";

const hasApiKey = Boolean(process.env.API_TENNIS_KEY && process.env.API_TENNIS_KEY !== "[SENSITIVE]");

async function apiJson<T>(page: Page, path: string): Promise<T> {
  const res = await page.request.get(path);
  return (await res.json()) as T;
}

test.describe("navigation and layout", () => {
  test("home renders the orange header, news and ranking widgets", async ({ page }) => {
    await gotoReady(page, "/");
    await expect(page.getByRole("link", { name: /zkortu\.pl, strona główna/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Najnowsze aktualności" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Ranking ATP/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Ranking WTA/ })).toBeVisible();
    const header = page.locator("header").first();
    await expect(header).toHaveClass(/bg-brand/);
  });

  test("main navigation reaches every section", async ({ page }) => {
    await gotoReady(page, "/");
    for (const [label, path] of [["Aktualności", "/aktualnosci"], ["Ranking", "/ranking"], ["Kalendarz", "/kalendarz"], ["Wideo", "/wideo"], ["Kontakt", "/kontakt"]] as const) {
      await page.getByRole("navigation", { name: "Główna nawigacja" }).getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
    }
  });
});

test.describe("live ticker and live page", () => {
  test.skip(!hasApiKey, "requires API_TENNIS_KEY");

  test("ticker shows exactly the matches the live API reports as in play", async ({ page }) => {
    await gotoReady(page, "/");
    const data = await apiJson<{ matches: Array<{ status: string; player1: { name: string }; player2: { name: string } }> }>(page, "/api/livescores?scope=tour");
    const live = data.matches.filter((m) => m.status === "live");
    const ticker = page.locator('[aria-label="Wyniki na żywo"]');
    if (live.length === 0) {
      await expect(ticker).toHaveCount(0);
      return;
    }
    await expect(ticker).toBeVisible();
    for (const m of live.slice(0, 3)) {
      await expect(ticker.getByText(m.player1.name, { exact: true }).first()).toBeVisible();
    }
    await expect(ticker.getByRole("link")).toHaveCount(live.length * 2 + 1);
  });

  test("live page lists matches and opens details with sets", async ({ page }) => {
    await gotoReady(page, "/wyniki-live");
    const data = await apiJson<{ matches: Array<{ id: string; status: string; player1: { name: string } }> }>(page, "/api/livescores?scope=tour");
    const today = await apiJson<{ matches: Array<{ id: string; status: string }> }>(page, `/api/matches?date=${new Date().toISOString().slice(0, 10)}&scope=tour`);
    const expected = new Set([...data.matches, ...today.matches].map((m) => m.id)).size;
    if (expected === 0) {
      await expect(page.getByText(/nie trwa żaden mecz|Brak meczów/)).toBeVisible();
      return;
    }
    const cards = page.locator("button[data-match]");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
    await cards.first().click();
    await expect(cards.first()).toHaveAttribute("aria-pressed", "true");
    const detail = page.locator(".anim-switch").filter({ hasText: /Sety|Mecz rozpocznie się|Brak wyniku|Statystyki/ }).first();
    await expect(detail).toBeVisible();
    await page.getByRole("button", { name: /Na żywo/ }).click();
    const merged = new Map<string, { status: string }>();
    for (const m of today.matches as Array<{ id: string; status: string }>) merged.set(m.id, m);
    for (const m of data.matches) merged.set(m.id, m);
    const liveCount = [...merged.values()].filter((m) => m.status === "live").length;
    if (liveCount === 0) await expect(page.getByText(/nie trwa żaden mecz/)).toBeVisible();
    else await expect(cards).toHaveCount(liveCount);
  });
});

test.describe("ranking", () => {
  test.skip(!hasApiKey, "requires API_TENNIS_KEY");

  test("shows 100 rows per page, switches tour and filters by name", async ({ page }) => {
    await gotoReady(page, "/ranking");
    await expect(page.getByRole("heading", { name: "Ranking ATP i WTA" })).toBeVisible();
    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(100);
    await expect(rows.first()).toContainText("1");
    await page.getByRole("tab", { name: "WTA" }).click();
    await expect(page).toHaveURL(/tour=wta/);
    await expect(rows.first()).toContainText(/Rybakina|Sabalenka|Swiatek|Gauff/);
    await page.getByPlaceholder(/Szukaj zawodnika/).fill("Swiatek");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("🇵🇱");
  });
});

test.describe("calendar", () => {
  test("opens a tournament sheet with details and matches", async ({ page }) => {
    const cal = await apiJson<{ tournaments: Array<{ id: string; name: string; status: string; location: string }> }>(page, "/api/calendar");
    const t = cal.tournaments.find((x) => x.status === "live") ?? cal.tournaments.find((x) => x.status === "completed") ?? cal.tournaments[0];
    test.skip(!t, "no tournaments in the calendar");
    await gotoReady(page, `/kalendarz?t=${encodeURIComponent(t.id)}`);
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText(t.name)).toBeVisible();
    await expect(sheet.getByText("Termin")).toBeVisible();
    if (hasApiKey && t.status !== "upcoming") {
      await expect(sheet.getByText(/Półfinał|Finał|Ćwierćfinał|runda|Mecze|Brak danych/).first()).toBeVisible({ timeout: 60_000 });
    }
  });

  test("day panel lists today's tournaments", async ({ page }) => {
    await gotoReady(page, "/kalendarz");
    await expect(page.getByText("Dzisiaj na kortach")).toBeVisible();
    const cal = await apiJson<{ tournaments: Array<{ status: string; name: string }> }>(page, "/api/calendar");
    const live = cal.tournaments.filter((t) => t.status === "live");
    if (live.length === 0) await expect(page.getByText(/Brak turniejów ATP\/WTA/)).toBeVisible();
    else await expect(page.getByRole("complementary").getByText(live[0].name)).toBeVisible();
  });
});

test.describe("comments", () => {
  test.skip(!process.env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN === "[SENSITIVE]", "requires SANITY_API_TOKEN for cleanup");

  test("submitting a comment shows the moderation notice and stores it unpublished", async ({ page }) => {
    const r = await fetch("https://g3425kho.api.sanity.io/v2024-01-01/data/query/production?query=" + encodeURIComponent('*[_type=="article" && defined(slug.current)][0].slug.current'));
    const slug = ((await r.json()) as { result: string | null }).result;
    test.skip(!slug, "no article in Sanity");
    const marker = `e2e-${Date.now()}`;
    await gotoReady(page, `/aktualnosci/${slug}`);
    await page.getByPlaceholder("Imię lub pseudonim").fill("Playwright");
    await page.getByPlaceholder("Napisz komentarz…").fill(`Komentarz e2e ${marker}`);
    await page.waitForTimeout(3000); // timing guard
    await page.getByRole("button", { name: "Opublikuj" }).click();
    await expect(page.getByText(/pojawi się po zatwierdzeniu/)).toBeVisible();
    await expect(page.getByText(marker)).toHaveCount(0);

    // cleanup
    const token = process.env.SANITY_API_TOKEN!;
    const q = await fetch(`https://g3425kho.api.sanity.io/v2024-01-01/data/query/production?query=${encodeURIComponent(`*[_type=="comment" && body match "*${marker}*"]._id`)}`, { headers: { Authorization: `Bearer ${token}` } });
    const ids = ((await q.json()) as { result: string[] }).result;
    expect(ids).toHaveLength(1);
    await fetch("https://g3425kho.api.sanity.io/v2024-01-01/data/mutate/production", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ mutations: ids.map((id) => ({ delete: { id } })) }) });
  });
});

test.describe("contact", () => {
  test("client-side validation blocks empty submissions", async ({ page }) => {
    await gotoReady(page, "/kontakt");
    const email = page.getByLabel(/Adres e-mail/);
    await email.fill("zly-adres");
    await expect(email).toHaveValue("zly-adres");
    await page.getByRole("button", { name: "Wyślij wiadomość" }).click();
    await expect(page.getByText("Podaj imię i nazwisko")).toBeVisible();
    await expect(page.getByText("Wybierz temat wiadomości")).toBeVisible();
  });
});
