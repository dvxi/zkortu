import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  globalSetup: "./tests/e2e/global-setup.ts",
  retries: 0,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    channel: "chrome",
    headless: true,
    locale: "pl-PL",
    timezoneId: "Europe/Warsaw",
    viewport: { width: 1280, height: 900 },
  },
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : { command: "npm run dev", url: "http://127.0.0.1:3000/robots.txt", reuseExistingServer: true, timeout: 180_000 },
});
