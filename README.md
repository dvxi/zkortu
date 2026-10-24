# zkortu.pl — portal tenisowy

Serwis z wynikami na żywo, rankingami ATP/WTA, aktualnościami, kalendarzem turniejów i wideo.
Next.js 16 (App Router) + Sanity CMS + API-Tennis + Resend, hostowany na Vercel.

## Uruchomienie lokalne

```bash
npm install
cp .env.local.example .env.local   # uzupełnij klucze
npm run dev                        # http://localhost:3000
```

Panel redakcji (Sanity Studio) działa pod `/studio`.

## Zmienne środowiskowe

| Zmienna | Opis |
|---|---|
| `API_TENNIS_KEY` | Klucz z konta api-tennis.com (fallback: `RAPIDAPI_KEY`). Bez niego rankingi, wyniki live i mecze pokazują stan „dane niedostępne”. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Projekt Sanity (`g3425kho`, `production`). |
| `SANITY_API_TOKEN` | Token z uprawnieniami Editor. Używany serwerowo do zapisu komentarzy i przez skrypty seedujące. |
| `SANITY_REVALIDATE_SECRET` | Sekret webhooka Sanity → `/api/revalidate`. |
| `RESEND_API_KEY` | Wysyłka formularza kontaktowego. **Domena `zkortu.pl` musi być zweryfikowana w resend.com/domains (rekordy SPF/DKIM)**, inaczej Resend odrzuca wysyłkę błędem 403 i formularz pokazuje komunikat o niedostępności. |
| `RESEND_FROM` | Opcjonalny nadawca, np. `zkortu.pl <onboarding@resend.dev>` do testów przed weryfikacją domeny (dostarcza tylko na adres właściciela konta). |
| `NEXT_PUBLIC_SITE_URL` | Kanoniczny adres serwisu (metadane, sitemap). |

Na Vercelu zmienne oznaczone jako *Sensitive* nie dają się pobrać przez `vercel env pull`; lokalnie trzeba je wpisać ręcznie.

## Skąd pochodzą dane

| Dane | Źródło | Odświeżanie |
|---|---|---|
| Artykuły, tagi, strony informacyjne, ustawienia, wideo | Sanity | ISR 60–300 s + webhook `/api/revalidate` |
| Kalendarz turniejów (nazwy, daty, nawierzchnia, zdjęcia, zwycięzcy) | Sanity (`tournament`) | ISR 300 s |
| Mecze w turnieju, mecze danego dnia | API-Tennis `get_fixtures`, dopasowane do turnieju z Sanity po nazwie/mieście lub przez pole `apiTournamentKey` | 2 min |
| Wyniki na żywo | API-Tennis `get_livescore` | bez cache, odpytywane co 30 s z przeglądarki |
| Rankingi ATP/WTA | API-Tennis `get_standings` | 1 h |
| Komentarze | Sanity (`comment`), moderacja w Studio | bez cache |

### Dlaczego kalendarz jest w Sanity, a nie z API

API-Tennis nie ma kalendarza sezonu: `get_tournaments` zwraca tylko nazwy i nawierzchnie (bez dat), a `get_fixtures` zna mecze dopiero po losowaniu. Dlatego terminarz jest kuratorowany w CMS, a API dokłada do niego wyniki, status „live” i mecze (dopasowanie po nazwie/mieście, weryfikowane: 52/52 turniejów sezonu). Pole `apiTournamentKey` w turnieju pozwala ręcznie przypiąć klucz z API, gdy automatyczne dopasowanie zawiedzie.

### Skąd brać daty sezonu: importer

`scripts/import-calendar.ts` buduje terminarz z publicznych źródeł i zapisuje go do Sanity:

- **WTA**: oficjalny JSON serwisu wtatennis.com (daty, nawierzchnia, miasto, kraj, pula nagród, poziom),
- **ATP**: niedokumentowane, publiczne API ESPN (nazwy, daty, miasta; poziom turnieju z mapy słów kluczowych),
- **API-Tennis**: uzupełnia `apiTournamentKey` i nawierzchnię.

Strona atptour.com jest chroniona przez Cloudflare i nie nadaje się do scrapowania; Wikipedia ma tabele sezonu, ale w zmiennym formacie. ESPN może zmienić format bez ostrzeżenia, dlatego importer nie działa w czasie żądania, tylko zasila Sanity, a redakcja zachowuje kontrolę (zdjęcia, opisy, zwycięzcy nie są nadpisywane).

```bash
npx tsx scripts/import-calendar.ts --year=2026 --dry-run      # podgląd bez zapisu
npx tsx scripts/import-calendar.ts --year=2026                # tworzy brakujące, uzupełnia pulę/kraj/klucz API
npx tsx scripts/import-calendar.ts --year=2026 --update-dates # dodatkowo nadpisuje daty istniejących
```

Import uruchamia się automatycznie co poniedziałek przez GitHub Actions (`.github/workflows/import-calendar.yml`; w grudniu dodatkowo importuje kolejny sezon). Wymaga sekretów repozytorium `API_TENNIS_KEY` i `SANITY_API_TOKEN` (Settings → Secrets and variables → Actions). Można go też odpalić ręcznie z zakładki Actions. Statusy „trwa/zakończony” i mecze turniejów nie wymagają importu: liczą się z dat i pobierają z API-Tennis na bieżąco.

Alternatywnie `scripts/seed-tournaments.mjs` zawiera ręcznie przygotowany sezon 2026 (52 turnieje).

## Struktura

```
app/                 strony (server components) + komponenty klienckie obok nich
app/api/             rankings, livescores, matches, calendar, tournaments/[id]/matches, comments, contact, revalidate
components/site/     współdzielone elementy UI (header, footer, karty, stany, odznaki)
components/ui/       prymitywy shadcn/ui (Base UI)
lib/api-tennis.ts    klient API-Tennis z detekcją błędów i cache
lib/sanity.ts        zapytania GROQ, mapowanie turniejów, komentarze
lib/countries.ts     kraje → kody ISO, flagi, polskie nazwy (Intl.DisplayNames)
lib/types.ts         typy domenowe i mapy kolorów
sanity/schemaTypes/  schemat CMS (article, tournament, comment, page, siteSettings, video, juniorPlayer)
scripts/             seedy Sanity (artykuły testowe, kalendarz sezonu)
```

## Testy

```bash
npm test                 # jednostkowe: parser API-Tennis na zapisanych odpowiedziach, kraje, formaty, mapowanie Sanity
npm run test:integration # trasy API na działającym serwerze (TEST_BASE_URL, domyślnie http://127.0.0.1:3000): rankingi, live, kalendarz, komentarze, formularz
npm run test:live        # autentyczność: wyniki dnia z API-Tennis vs ESPN, daty kalendarza vs wtatennis.com i ESPN, mecze turniejów w oknie dat
npm run test:e2e         # Playwright w zainstalowanym Chrome: nawigacja, ticker, ranking, kalendarz, komentarz, walidacja formularza
```

Testy integracyjne, live i e2e czytają klucze z `.env.local`; bez `API_TENNIS_KEY` i `SANITY_API_TOKEN` odpowiednie przypadki są pomijane. Testy komentarzy tworzą i usuwają własny dokument.

## Skrypty

```bash
npm run dev / build / start / lint
node --env-file=.env.local scripts/seed-tournaments.mjs   # ręczny kalendarz sezonu 2026 (idempotentny)
npx tsx scripts/import-calendar.ts --year=2026 --dry-run  # import kalendarza z WTA + ESPN (patrz niżej)
```

## Webhook odświeżania treści

W [sanity.io/manage](https://sanity.io/manage) → API → Webhooks dodaj:

- URL: `https://zkortu.pl/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`
- Trigger: create, update, delete
- Projection: `{ _type, "slug": slug.current }`

Bez webhooka zmiany w CMS pojawiają się po maksymalnie 5 minutach.

## Komentarze

Formularz pod artykułem zapisuje dokument `comment` z `approved: false` (chyba że w Ustawieniach serwisu włączono publikację bez moderacji). Zatwierdzanie: Studio → Komentarze → Do moderacji. Ochrona: honeypot, limit czasu, limit 5 komentarzy / 10 min na adres IP (skrót IP zapisany w dokumencie).

## Wdrożenie

Push na `main` → Vercel (region `fra1`). Sekcja juniorska (`/tenis-juniorski`) jest tymczasowo przekierowana na stronę główną w `next.config.ts`.
