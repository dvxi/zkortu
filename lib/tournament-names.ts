/**
 * Polish display names for tournaments from API-Tennis, which uses English
 * city names ("Rome", "Paris") and English event names ("French Open").
 * Display only: never use the result to match tournaments against the API.
 */

/** Whole event names. */
const EVENTS: Record<string, string> = {
  "french open": "Roland Garros",
  "roland garros": "Roland Garros",
  "olympic games": "Igrzyska olimpijskie",
  "olympics": "Igrzyska olimpijskie",
  "davis cup": "Puchar Davisa",
  "billie jean king cup": "Billie Jean King Cup",
};

/** English city names → Polish exonyms (only cities that have one). */
const CITIES: Record<string, string> = {
  "Rome": "Rzym",
  "Paris": "Paryż",
  "London": "Londyn",
  "Madrid": "Madryt",
  "Vienna": "Wiedeń",
  "Basel": "Bazylea",
  "Geneva": "Genewa",
  "Antwerp": "Antwerpia",
  "Stockholm": "Sztokholm",
  "Turin": "Turyn",
  "Beijing": "Pekin",
  "Shanghai": "Szanghaj",
  "Tokyo": "Tokio",
  "Seoul": "Seul",
  "Munich": "Monachium",
  "Brussels": "Bruksela",
  "Lisbon": "Lizbona",
  "Athens": "Ateny",
  "Cologne": "Kolonia",
  "Prague": "Praga",
  "Warsaw": "Warszawa",
  "Budapest": "Budapeszt",
  "Bucharest": "Bukareszt",
  "Belgrade": "Belgrad",
  "Zagreb": "Zagrzeb",
  "Milan": "Mediolan",
  "Florence": "Florencja",
  "Naples": "Neapol",
  "Seville": "Sewilla",
  "Marseille": "Marsylia",
  "Nice": "Nicea",
  "Mallorca": "Majorka",
  "Marrakech": "Marrakesz",
  "Cairo": "Kair",
  "Hong Kong": "Hongkong",
  "Guangzhou": "Kanton",
  "Nanjing": "Nankin",
  "Tianjin": "Tiencin",
  "Ostrava": "Ostrawa",
  "Mexico City": "Meksyk",
  "Moscow": "Moskwa",
  "St. Petersburg": "Sankt Petersburg",
  "Saint Petersburg": "Sankt Petersburg",
  "Washington": "Waszyngton",
  "New York": "Nowy Jork",
  "Dubai": "Dubaj",
  "Riyadh": "Rijad",
  "Strasbourg": "Strasburg",
  "Copenhagen": "Kopenhaga",
  "Gothenburg": "Göteborg",
  "Bastad": "Båstad",
  "Kitzbuhel": "Kitzbühel",
  "Gstaad": "Gstaad",
  "Barcelona": "Barcelona",
  "Valencia": "Walencja",
  "Bordeaux": "Bordeaux",
  "Lyon": "Lyon",
  "Rio de Janeiro": "Rio de Janeiro",
  "Sao Paulo": "São Paulo",
  "Bogota": "Bogota",
  "Santiago": "Santiago",
  "Buenos Aires": "Buenos Aires",
  "Kyiv": "Kijów",
  "Vilnius": "Wilno",
  "Riga": "Ryga",
  "Bratislava": "Bratysława",
  "Sofia": "Sofia",
  "Linz": "Linz",
  "Luxembourg": "Luksemburg",
  "Monterrey": "Monterrey",
  "Wroclaw": "Wrocław",
  "Gdynia": "Gdynia",
  "Szczecin": "Szczecin",
  "Poznan": "Poznań",
  "Krakow": "Kraków",
  "Lodz": "Łódź",
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// longest first so "Mexico City" wins over a shorter overlapping name
const CITY_PATTERN = new RegExp(`\\b(${Object.keys(CITIES).sort((a, b) => b.length - a.length).map(escape).join("|")})\\b`, "g");

/** "Rome" → "Rzym", "Finals - Turin" → "Finals - Turyn", "French Open" → "Roland Garros". */
export function tournamentNamePl(name: string): string {
  const trimmed = name.trim();
  const event = EVENTS[trimmed.toLowerCase()];
  if (event) return event;
  return trimmed.replace(CITY_PATTERN, (city) => CITIES[city] ?? city);
}

/**
 * Titles that count as main-tour titles: Grand Slams, ATP/WTA 250-1000, tour finals.
 * API-Tennis marks lower levels in the name ("Montreux (Challenger)", "W60 Prague (ITF)",
 * "M25 …"); the Olympics are not an ATP/WTA title either.
 */
export function isMainTourTitle(name: string): boolean {
  return !/\((itf|challenger)\)|^\s*[wm]\d{2,3}\b|\bitf\b|challenger|\b125\b|olympic/i.test(name);
}
