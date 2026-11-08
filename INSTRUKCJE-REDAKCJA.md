# Instrukcja dla redakcji zkortu.pl

Panel: **https://zkortu.pl/studio** (logowanie kontem Sanity).

## Artykuł

1. Artykuły → **+ Nowy**.
2. Zakładka **Treść**: tytuł, adres URL (generuje się z tytułu), **lead** (2–3 zdania, pokazuje się pod tytułem i na listach), kategoria, tagi (np. `Iga Świątek`, `WTA`; klikalne na stronie), **zdjęcie główne** w formacie 16:9 z podpisem i źródłem (np. `fot. Jan Kowalski / PAP`), treść.
3. W treści dostępne są: akapit, lead, nagłówki H2/H3, cytat, listy, linki, **zdjęcie w treści** (z podpisem) oraz **Osadzony wpis**: wklej kod z opcji „Osadź” na X, Instagramie lub YouTube.
4. Zakładka **Autor i źródło**: autor uzupełnia się z zalogowanego konta Sanity (można go zmienić), data publikacji domyślnie wskazuje dzisiaj. Pole **Dokładny czas publikacji** ustawia się na moment utworzenia wpisu; przy późniejszej publikacji popraw je na właściwy termin. Dzięki niemu karty pokazują np. „55 min temu”. Starsze wpisy bez godziny zachowują etykietę z datą. Rola, źródło, data aktualizacji i czas czytania pozostają dostępne.
5. **Krótki tytuł na stronę główną** jest opcjonalny: zastępuje tytuł tylko na kartach strony głównej. Pełny tytuł pozostaje w artykule i aktualnościach. URL generuje się po wpisaniu tytułu; późniejsze zmiany tytułu nie zmieniają adresu.
6. Główny news wybierzesz w **Ustawienia serwisu → Strona główna → Główny artykuł**. Wybierz opublikowany tekst i opublikuj ustawienia. Można w ten sposób przywrócić także starszy artykuł. Bez tego wyboru używany jest ostatnio zmieniony artykuł oznaczony **Wyróżniony**, a następnie najnowszy news.
7. Zakładka **SEO** zawiera opcjonalny tytuł SEO i opis. Domyślnie używane są pełny tytuł i lead; strona tworzy metadane udostępnień, adres kanoniczny i dane NewsArticle.
8. **Opublikuj**. Strona odświeża się w ciągu kilku sekund (webhook) lub maksymalnie po minucie.

## Komentarze

Komentarze czytelników trafiają do **Komentarze → Do moderacji**. Otwórz komentarz, zaznacz **Zatwierdzony** i opublikuj, albo usuń. W **Ustawieniach serwisu** można włączyć publikację bez moderacji lub wyłączyć komentarze.

## Kalendarz turniejów

**Kalendarz turniejów → + Nowy**: nazwa, miasto, kraj (po polsku), kod kraju (np. `FR`), nawierzchnia, kategoria, daty, zdjęcie (2:1, np. z materiałów prasowych ATP/WTA), pula nagród, obrońca tytułu, poprzedni zwycięzcy, link do transmisji.

Wyniki i mecze turnieju dopasowują się automatycznie po nazwie i mieście. Jeśli turniej nie pokazuje meczów, w zakładce **Integracja wyników** wpisz klucz turnieju z API-Tennis (dostarcza administrator).

Status „trwa / nadchodzący / zakończony” liczy się z dat, nie trzeba go ustawiać.

## Wideo

Tytuł, link YouTube, kategoria (Skróty / Cały mecz / Wywiad / Analiza), turniej, zawodnicy, data, czas trwania. Miniatura pobiera się z YouTube.

## Strony informacyjne

Regulamin, polityka prywatności, „O nas”, oferta reklamowa. Każda strona z włączonym „Pokaż link w stopce” pojawia się automatycznie w stopce (kolejność według pola „Kolejność”).

## Ustawienia serwisu

Dane kontaktowe, media społecznościowe, godziny pracy, FAQ na stronie Kontakt, opis w stopce, logo (SVG/PNG), domyślny obraz do udostępniania, przełączniki komentarzy.

## Układ strony głównej

W **Ustawienia serwisu → Strona główna** można ustawić kolejność sekcji na telefonie. Domyślnie: newsy, mecze Polek i Polaków, WTA, więcej z redakcji, turnieje, ATP, wideo. Zmiana nie wpływa na układ desktopowy.

**Mecze Polek i Polaków** (na górze prawej kolumny) wypełniają się same z danych API: wszystkie dzisiejsze mecze Polaków z rankingów ATP i WTA, na każdym poziomie (ATP, WTA, Challenger, ITF), single i deble. Gdy dziś nie ma meczów, pokazuje się plan na jutro, a gdy jutro też nic, sekcja znika. Deblistów bez rankingu singlowego (np. Jan Zieliński) na razie tu nie ma.

**Sekcje tematyczne** zastępują blok „Więcej z redakcji”. Dodaj nagłówek (np. „Iga Świątek”), dokładną nazwę tagu i opcjonalną kategorię. Każda sekcja pokazuje do sześciu najnowszych pasujących artykułów. Kolejność sekcji zmienisz przez przeciąganie; pusta lista przywraca „Więcej z redakcji”. Po zmianach opublikuj ustawienia.
