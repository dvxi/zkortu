/** Warm up the dev server so Turbopack compiles every route before the timed assertions run. */
export default async function globalSetup() {
  const base = process.env.TEST_BASE_URL || "http://localhost:3000";
  const routes = ["/", "/aktualnosci", "/wyniki-live", "/ranking", "/ranking?tour=wta", "/kalendarz", "/wideo", "/kontakt", "/api/livescores?scope=tour", "/api/calendar"];
  for (const r of routes) {
    try {
      await fetch(`${base}${r}`, { signal: AbortSignal.timeout(120_000) });
    } catch {
      /* server may be starting; tests will report */
    }
  }
}
