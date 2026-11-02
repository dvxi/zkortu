import { expect, test, type Page } from "@playwright/test";
import { toMatch } from "../../lib/api-tennis";
import { fixture } from "../helpers";
import type { LiveMatch } from "../../lib/types";

const raw = fixture<{ result: Parameters<typeof toMatch>[0][] }>("livescore.json").result[0];
const base = toMatch(raw, new Map());
const live: LiveMatch = { ...base, id: "feedback-live", status: "live", player1: { ...base.player1, name: "Zawodniczka testowa" }, stats: { aces: [3, 4], doubleFaults: [1, 2], firstServePct: [60, 70], firstServeWon: [72, 65], secondServeWon: [42, 55], winners: [12, 15], unforcedErrors: [5, 8], totalPointsWon: [60, 64], breakPoints: ["1/3", "2/5"] } };
const finished: LiveMatch = { ...live, id: "feedback-finished", status: "finished" };

async function mockMatches(page: Page) {
  await page.route("**/api/livescores?**", (route) => route.fulfill({ json: { matches: [live] } }));
  await page.route("**/api/matches?**", (route) => route.fulfill({ json: { matches: [live, finished] } }));
}

test("live is the default filter; direct links also select finished matches", async ({ page }) => {
  await mockMatches(page);
  await page.goto("/wyniki-live");
  await expect(page.locator("button[data-match]")).toHaveCount(1);
  await expect(page.locator('[data-match="feedback-live"]')).toBeVisible();
  await page.goto("/wyniki-live?match=feedback-finished");
  await expect(page.locator('[data-match="feedback-finished"]')).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: "test-results/feedback-desktop-live.png", fullPage: true });
  const panel = page.locator(".sticky.top-24");
  expect(await panel.evaluate((el) => getComputedStyle(el).overflowY)).toBe("auto");
});

test("mobile ticker opens the selected match and the bottom menu opens navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockMatches(page);
  await page.goto("/");
  const bottom = page.getByRole("navigation", { name: "Dolna nawigacja" });
  await expect(bottom).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("padding-bottom", "0px");
  const wta = await page.locator("#ranking-WTA").boundingBox();
  const atp = await page.locator("#ranking-ATP").boundingBox();
  expect(wta!.y).toBeLessThan(atp!.y);
  await page.screenshot({ path: "test-results/feedback-mobile-home.png", fullPage: true });
  await bottom.getByRole("button", { name: "Otwórz pełne menu" }).click();
  await expect(page.getByRole("navigation", { name: "Nawigacja mobilna" })).toBeVisible();
  await page.getByRole("button", { name: "Zamknij menu" }).click();
  const ticker = page.locator('[aria-label="Wyniki na żywo"]');
  await expect(ticker).toBeVisible();
  const match = ticker.locator('a[href="/wyniki-live?match=feedback-live"]').first();
  // Pause movement while selecting a ticker entry, as keyboard focus does.
  await match.focus();
  await match.click();
  await expect(page).toHaveURL(/match=feedback-live/);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Zawodniczka testowa", { exact: true }).first()).toBeVisible();
  await dialog.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await expect(dialog.getByText("Wykorzystane break pointy")).toBeVisible();
});

test("calendar distinguishes qualifying finals and shows newest matches first", async ({ page }) => {
  const response = await page.request.get("/api/calendar");
  const { tournaments } = await response.json() as { tournaments: Array<{ id: string }> };
  test.skip(!tournaments.length, "requires a tournament in CMS");
  await page.route("**/api/tournaments/*/matches", (route) => route.fulfill({ json: { matches: [
    { ...finished, id: "qualifying-final", round: "Finał", date: "2026-10-20", isQualifying: true },
    { ...finished, id: "main-final", round: "Finał", date: "2026-10-25", isQualifying: false },
  ] } }));
  await page.goto(`/kalendarz?t=${encodeURIComponent(tournaments[0].id)}`);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("2026-10-20 · Kwalifikacje · Finał", { exact: true })).toBeAttached();
  const headings = dialog.locator("p").filter({ hasText: /^2026-10-\d+ ·/ });
  await expect(headings).toHaveText(["2026-10-25 · Finał", "2026-10-20 · Kwalifikacje · Finał"]);
  expect(await dialog.evaluate((el) => el.scrollTop)).toBe(0);
});
