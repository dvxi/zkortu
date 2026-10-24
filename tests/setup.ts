import { readFileSync } from "node:fs";

// Load .env.local (same values the app uses) without a dotenv dependency.
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]] && m[2] !== "[SENSITIVE]") process.env[m[1]] = m[2];
  }
} catch {
  /* no .env.local */
}

export const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
