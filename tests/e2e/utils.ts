import type { Page } from "@playwright/test";

/** Navigate and wait until client chunks are loaded and React has hydrated (dev server compiles on first hit). */
export async function gotoReady(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);
  // hydration marker: Next attaches data-nextjs-* / React root; a short settle is enough after networkidle
  await page.waitForTimeout(400);
}
