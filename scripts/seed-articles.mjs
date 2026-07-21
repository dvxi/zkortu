/**
 * Seed Sanity with mock articles from lib/mock-data.ts
 *
 * Usage (after setting env vars):
 *   SANITY_PROJECT_ID=xxx SANITY_DATASET=production SANITY_TOKEN=xxx node scripts/seed-articles.mjs
 *
 * Requires: npm install -g @sanity/client  (or use npx)
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  token: process.env.SANITY_TOKEN,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// ── Inline mock data (copy of lib/mock-data.ts articles) ──────────────────────
// Update this list if mock articles change, or replace with a dynamic import.

const mockArticles = [
  {
    id: "n1",
    title: "Swiatek triumfuje w Paryzu — czwarty tytul Roland Garros z rzedu",
    excerpt: "Iga Swiatek pokonala Aryne Sabalenke 7-5, 6-3 w finalowym meczu Roland Garros.",
    category: "Roland Garros",
    date: "2026-06-02",
    readTime: 4,
    imageQuery: "tennis court paris",
    featured: true,
    author: "Marcin Kowalski",
    authorRole: "Redaktor naczelny",
    content: [
      { type: "lead", text: "Iga Swiatek zapisala sie na kartach historii tenisa." },
      { type: "paragraph", text: "Finalowy mecz z Aryna Sabalenka rozpoczal sie w napietej atmosferze." },
      { type: "heading", text: "Kluczowe momenty finalu" },
      { type: "paragraph", text: "Pierwszy set przebiegal pod dyktando obu zawodniczek na zmiane." },
      { type: "quote", text: "Wiedzialem, ze mam dzis dobry dzien na korcie.", author: "Iga Swiatek, po finale" },
    ],
  },
  {
    id: "n2",
    title: "Alcaraz vs Hurkacz: Spektakularny mecz na korcie Phillipe Chatrier",
    excerpt: "Carlos Alcaraz rozgrywal jeden z najlepszych meczow sezonu przeciwko Hubertowi Hurkaczowi.",
    category: "Roland Garros",
    date: "2026-06-02",
    readTime: 3,
    imageQuery: "tennis player action",
    author: "Anna Nowak",
    authorRole: "Korespondent Roland Garros",
    content: [
      { type: "lead", text: "Cwierc-final Roland Garros pomiedzy Carlosem Alcarazem a Hubertem Hurkaczem." },
      { type: "paragraph", text: "Mecz rozpoczal sie od wyrownanych wymian." },
      { type: "quote", text: "Hubert gral dzis swietnie.", author: "Carlos Alcaraz, po meczu" },
    ],
  },
  {
    id: "n3",
    title: "Hurkacz awansuje do czolowki ATP — 13. miejsce w rankingu",
    excerpt: "Po swietnej passie turniejowej Hubert Hurkacz umocnil sie na 13. pozycji.",
    category: "Polska",
    date: "2026-06-02",
    readTime: 2,
    imageQuery: "tennis champion trophy",
    author: "Piotr Wisniewski",
    authorRole: "Dziennikarz sportowy",
    content: [
      { type: "lead", text: "Hubert Hurkacz jest dzis na 13. miejscu rankingu ATP." },
      { type: "paragraph", text: "Sezon 2026 to dla Hurkacza przelamanie." },
      { type: "quote", text: "Pracujemy ciezko, by poprawic gre od podstaw.", author: "Hubert Hurkacz" },
    ],
  },
];

async function seed() {
  console.log(`Seeding ${mockArticles.length} articles to Sanity...`);
  for (const a of mockArticles) {
    const doc = {
      _type: "article",
      _id: `article-${a.id}`,
      title: a.title,
      slug: { _type: "slug", current: a.id },
      excerpt: a.excerpt,
      category: a.category,
      date: a.date,
      readTime: a.readTime,
      imageQuery: a.imageQuery ?? "",
      featured: a.featured ?? false,
      author: a.author,
      authorRole: a.authorRole ?? "",
      content: a.content.map((block, i) => ({
        _type: "contentBlock",
        _key: `block-${i}`,
        type: block.type,
        text: block.text,
        quoteAuthor: block.author ?? "",
      })),
    };
    await client.createOrReplace(doc);
    console.log(`  ✓ ${a.id}: ${a.title.slice(0, 50)}`);
  }
  console.log("Seed complete.");
}

seed().catch((err) => { console.error(err); process.exit(1); });
