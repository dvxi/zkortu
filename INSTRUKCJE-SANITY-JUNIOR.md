# Instrukcja: Aktualizacja rankingów juniorskich w Sanity Studio

## Kiedy aktualizować?

ITF publikuje zaktualizowane rankingi juniorów **co poniedziałek** ok. godz. 10:00 UTC.
Źródło: https://www.itftennis.com/en/rankings/junior-rankings/

---

## Gdzie wejść?

1. Otwórz Sanity Studio: **https://zkortu.sanity.studio**
2. Zaloguj się swoim kontem Sanity.
3. W lewym menu wybierz **"Zawodnik juniorski"**.

---

## Jak dodać nowego zawodnika?

1. Kliknij **"+ Nowy zawodnik juniorski"** (przycisk w prawym górnym rogu lub obok listy).
2. Wypełnij pola:

   | Pole | Co wpisać | Przykład |
   |---|---|---|
   | **Kategoria** | Wybierz Chłopcy lub Dziewczynki | `Chłopcy (Boys)` |
   | **Miejsce w rankingu** | Numer w rankingu ITF | `1` |
   | **Imię i nazwisko** | Pełne imię i nazwisko (jak na stronie ITF) | `Carlos Alcaraz` |
   | **Kraj** | Wybierz z listy (flagi są widoczne) | `Hiszpania 🇪🇸` |
   | **Punkty ITF** | Liczba punktów z rankingu | `840` |
   | **Zmiana pkt** | Różnica względem poprzedniego tygodnia (może być ujemna) | `+40` lub `-15` lub `0` |
   | **Data rankingu ITF** | Poniedziałkowa data publikacji rankingu | `2026-07-28` |

3. Kliknij **"Opublikuj"** (zielony przycisk w prawym górnym rogu).

---

## Jak zaktualizować istniejącego zawodnika?

1. Znajdź zawodnika na liście (możesz wyszukiwać po nazwisku).
2. Kliknij na rekord, żeby go otworzyć.
3. Zmień odpowiednie pola (nowe miejsce, punkty, zmiana, data).
4. Kliknij **"Opublikuj"**.

> **Uwaga:** Jeśli zawodnik wypadł z Top 20, usuń jego rekord (ikona kosza) lub zaktualizuj numer miejsca.

---

## Tygodniowa procedura (krok po kroku)

### 1. Pobierz nowe dane z ITF

Wejdź na https://www.itftennis.com/en/rankings/junior-rankings/ i wybierz:
- **Boys Juniors** — lista chłopców
- **Girls Juniors** — lista dziewcząt

Zapisz sobie Top 20 każdej listy (miejsce, imię, kraj, punkty).

### 2. Zaktualizuj Sanity

Dla każdego zawodnika z listy ITF:
- Jeśli **jest już w Sanity** → otwórz rekord, zaktualizuj miejsce, punkty, zmianę pkt i datę → Opublikuj.
- Jeśli **nie ma go w Sanity** → dodaj nowy rekord z wszystkimi polami → Opublikuj.
- Jeśli **ktoś wypadł z Top 20** → otwórz jego rekord i usuń go (ikona kosza → "Usuń") albo zmień numer miejsca.

### 3. Zmiana punktów

Pole **"Zmiana pkt"** to różnica między bieżącymi a poprzednimi punktami:
- Zawodnik miał 720 pkt, teraz ma 760 pkt → wpisz `40`
- Zawodnik miał 720 pkt, teraz ma 705 pkt → wpisz `-15`
- Bez zmiany → wpisz `0`

### 4. Sprawdź wynik

Po opublikowaniu wejdź na https://zkortu.vercel.app/tenis-juniorski — rankingi powinny się zaktualizować w ciągu kilku sekund (strona pobiera dane na żywo z Sanity).

---

## Często zadawane pytania

**Nie ma mojego kraju na liście?**
Skontaktuj się z administratorem strony — dodamy kraj do listy.

**Jak usunąć zawodnika?**
Otwórz rekord → kliknij ikonę trzech kropek (…) lub strzałkę w dół obok "Opublikuj" → wybierz "Usuń".

**Strona nie aktualizuje się od razu?**
Odśwież stronę (Ctrl+F5 lub Cmd+Shift+R). Jeśli problem pozostaje, sprawdź czy rekord ma status "Opublikowany" (nie "Wersja robocza") w Sanity Studio.

**Czy kolejność na stronie jest automatyczna?**
Tak — strona zawsze sortuje zawodników rosnąco według numeru miejsca w rankingu. Ważne żeby wpisać poprawny numer.
