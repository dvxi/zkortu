# zkortu.pl — Portal Tenisowy

Makieta/POC portalu tenisowego zbudowana z Next.js 16, shadcn/ui i Tailwind CSS.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **shadcn/ui** (Base UI)
- **Tailwind CSS v4**
- **Lucide React** — ikony
- **Unsplash** — zdjęcia demonstracyjne

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

## Budowanie

```bash
npm run build
npm start
```

## Wdrożenie na Vercel

```bash
npm i -g vercel
vercel
```

Lub połącz repozytorium z Vercel Dashboard — projekt jest automatycznie wykrywany jako Next.js.

## Strony

| Ścieżka | Opis |
|---|---|
| `/` | Strona główna — hero, ticker live, aktualności, ranking, turnieje |
| `/aktualnosci` | Aktualności z filtrami dat i kategorii |
| `/wyniki-live` | Wyniki na żywo — panel boczny + szczegóły meczu |
| `/wideo` | Skróty meczów z linkami do YouTube |
| `/ranking` | Rankingi ATP/WTA — Główny, Live, Race |
| `/kalendarz` | Kalendarz turniejów + dzisiejsze mecze |
| `/tenis-juniorski` | Tenis juniorski — rankingi i aktualności |
| `/kontakt` | Formularz kontaktowy |

## Dane

Wszystkie dane są przykładowe (`/lib/mock-data.ts`) i służą wyłącznie celom demonstracyjnym.
