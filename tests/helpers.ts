import { readFileSync } from "node:fs";
import path from "node:path";

// TEST_BASE_URL (not BASE_URL: Vitest exposes Vite's BASE_URL="/" on process.env)
export const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

export function fixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(path.join(__dirname, "fixtures", name), "utf8")) as T;
}

/** true when the dev/prod server answers on BASE_URL */
export async function serverUp(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/robots.txt`, { signal: AbortSignal.timeout(10_000) });
    return res.ok;
  } catch {
    return false;
  }
}

export function hasApiKey(): boolean {
  const k = process.env.API_TENNIS_KEY || process.env.RAPIDAPI_KEY;
  return Boolean(k && k !== "[SENSITIVE]");
}

export function hasSanityToken(): boolean {
  const t = process.env.SANITY_API_TOKEN;
  return Boolean(t && t !== "[SENSITIVE]");
}

export async function getJson<T = unknown>(url: string, init?: RequestInit): Promise<{ status: number; body: T }> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(120_000) });
  const text = await res.text();
  let body: T;
  try {
    body = JSON.parse(text) as T;
  } catch {
    throw new Error(`Non-JSON response (${res.status}) from ${url}: ${text.slice(0, 200)}`);
  }
  return { status: res.status, body };
}

export function todayWarsaw(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/** "J. Fearnley" / "Jacob Fearnley" / "P. Carreno-Busta" → comparable key "fearnley|j" */
export function playerKey(name: string): string {
  const norm = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-']/g, " ")
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = norm.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  const last = parts[parts.length - 1];
  const initial = parts[0][0];
  return `${last}|${initial}`;
}

/** Sanity read via public API (dataset is public) or token when available. */
export async function sanityQuery<T>(query: string, params: Record<string, string> = {}): Promise<T> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "g3425kho";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const qs = new URLSearchParams({ query, perspective: "published" });
  for (const [k, v] of Object.entries(params)) qs.set(`$${k}`, JSON.stringify(v));
  const headers: Record<string, string> = {};
  if (hasSanityToken()) headers.Authorization = `Bearer ${process.env.SANITY_API_TOKEN}`;
  const res = await fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?${qs}`, { headers, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
  return ((await res.json()) as { result: T }).result;
}

export async function sanityMutate(mutations: unknown[]): Promise<void> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "g3425kho";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const res = await fetch(`https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Sanity mutate failed: ${res.status} ${await res.text()}`);
}
