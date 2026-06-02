// ─── Players ─────────────────────────────────────────────────────────────────

export interface Player {
  rank: number;
  name: string;
  country: string;
  flag: string;
  points: number;
  pointsDiff: number;
  age: number;
  bestRank: number;
}

export const atpPlayers: Player[] = [
  { rank: 1, name: "Jannik Sinner", country: "Włochy", flag: "🇮🇹", points: 11340, pointsDiff: +210, age: 22, bestRank: 1 },
  { rank: 2, name: "Carlos Alcaraz", country: "Hiszpania", flag: "🇪🇸", points: 9755, pointsDiff: -150, age: 23, bestRank: 1 },
  { rank: 3, name: "Alexander Zverev", country: "Niemcy", flag: "🇩🇪", points: 7135, pointsDiff: +45, age: 28, bestRank: 2 },
  { rank: 4, name: "Daniil Medvedev", country: "Rosja", flag: "🇷🇺", points: 6640, pointsDiff: -120, age: 28, bestRank: 1 },
  { rank: 5, name: "Casper Ruud", country: "Norwegia", flag: "🇳🇴", points: 5120, pointsDiff: +310, age: 25, bestRank: 2 },
  { rank: 6, name: "Andrey Rublev", country: "Rosja", flag: "🇷🇺", points: 4895, pointsDiff: -80, age: 26, bestRank: 5 },
  { rank: 7, name: "Holger Rune", country: "Dania", flag: "🇩🇰", points: 4710, pointsDiff: +175, age: 21, bestRank: 4 },
  { rank: 8, name: "Taylor Fritz", country: "USA", flag: "🇺🇸", points: 4230, pointsDiff: +55, age: 27, bestRank: 4 },
  { rank: 9, name: "Tommy Paul", country: "USA", flag: "🇺🇸", points: 3980, pointsDiff: -90, age: 27, bestRank: 9 },
  { rank: 10, name: "Ben Shelton", country: "USA", flag: "🇺🇸", points: 3765, pointsDiff: +420, age: 22, bestRank: 10 },
  { rank: 11, name: "Stefanos Tsitsipas", country: "Grecja", flag: "🇬🇷", points: 3540, pointsDiff: -210, age: 25, bestRank: 3 },
  { rank: 12, name: "Grigor Dimitrov", country: "Bułgaria", flag: "🇧🇬", points: 3280, pointsDiff: +60, age: 33, bestRank: 3 },
  { rank: 13, name: "Hubert Hurkacz", country: "Polska", flag: "🇵🇱", points: 3120, pointsDiff: +195, age: 27, bestRank: 7 },
  { rank: 14, name: "Frances Tiafoe", country: "USA", flag: "🇺🇸", points: 2955, pointsDiff: -40, age: 26, bestRank: 10 },
  { rank: 15, name: "Sebastian Korda", country: "USA", flag: "🇺🇸", points: 2810, pointsDiff: +230, age: 24, bestRank: 15 },
  { rank: 16, name: "Lorenzo Musetti", country: "Włochy", flag: "🇮🇹", points: 2690, pointsDiff: +145, age: 22, bestRank: 16 },
  { rank: 17, name: "Jack Draper", country: "Wielka Brytania", flag: "🇬🇧", points: 2545, pointsDiff: +380, age: 23, bestRank: 17 },
  { rank: 18, name: "Alex de Minaur", country: "Australia", flag: "🇦🇺", points: 2430, pointsDiff: -115, age: 25, bestRank: 9 },
  { rank: 19, name: "Ugo Humbert", country: "Francja", flag: "🇫🇷", points: 2310, pointsDiff: +75, age: 26, bestRank: 19 },
  { rank: 20, name: "Arthur Fils", country: "Francja", flag: "🇫🇷", points: 2185, pointsDiff: +290, age: 20, bestRank: 20 },
];

export const wtaPlayers: Player[] = [
  { rank: 1, name: "Aryna Sabalenka", country: "Białoruś", flag: "🇧🇾", points: 10760, pointsDiff: +175, age: 26, bestRank: 1 },
  { rank: 2, name: "Iga Świątek", country: "Polska", flag: "🇵🇱", points: 9835, pointsDiff: +645, age: 24, bestRank: 1 },
  { rank: 3, name: "Coco Gauff", country: "USA", flag: "🇺🇸", points: 7215, pointsDiff: -90, age: 21, bestRank: 2 },
  { rank: 4, name: "Elena Rybakina", country: "Kazachstan", flag: "🇰🇿", points: 6540, pointsDiff: +210, age: 25, bestRank: 3 },
  { rank: 5, name: "Jasmine Paolini", country: "Włochy", flag: "🇮🇹", points: 5890, pointsDiff: +420, age: 28, bestRank: 4 },
  { rank: 6, name: "Qinwen Zheng", country: "Chiny", flag: "🇨🇳", points: 5120, pointsDiff: +165, age: 22, bestRank: 5 },
  { rank: 7, name: "Jessica Pegula", country: "USA", flag: "🇺🇸", points: 4680, pointsDiff: -85, age: 30, bestRank: 3 },
  { rank: 8, name: "Mirra Andreeva", country: "Rosja", flag: "🇷🇺", points: 4215, pointsDiff: +310, age: 17, bestRank: 8 },
  { rank: 9, name: "Barbora Krejčíková", country: "Czechy", flag: "🇨🇿", points: 3980, pointsDiff: -145, age: 28, bestRank: 2 },
  { rank: 10, name: "Madison Keys", country: "USA", flag: "🇺🇸", points: 3710, pointsDiff: +255, age: 29, bestRank: 7 },
  { rank: 11, name: "Daria Kasatkina", country: "Rosja", flag: "🇷🇺", points: 3490, pointsDiff: +80, age: 27, bestRank: 8 },
  { rank: 12, name: "Emma Navarro", country: "USA", flag: "🇺🇸", points: 3270, pointsDiff: +490, age: 23, bestRank: 12 },
  { rank: 13, name: "Paula Badosa", country: "Hiszpania", flag: "🇪🇸", points: 3050, pointsDiff: +170, age: 26, bestRank: 2 },
  { rank: 14, name: "Elina Svitolina", country: "Ukraina", flag: "🇺🇦", points: 2840, pointsDiff: -65, age: 29, bestRank: 3 },
  { rank: 15, name: "Karolína Muchová", country: "Czechy", flag: "🇨🇿", points: 2630, pointsDiff: +195, age: 28, bestRank: 8 },
  { rank: 16, name: "Beatriz Haddad Maia", country: "Brazylia", flag: "🇧🇷", points: 2445, pointsDiff: +115, age: 28, bestRank: 10 },
  { rank: 17, name: "Liudmila Samsonova", country: "Rosja", flag: "🇷🇺", points: 2280, pointsDiff: -40, age: 25, bestRank: 15 },
  { rank: 18, name: "Anna Kalinskaya", country: "Rosja", flag: "🇷🇺", points: 2095, pointsDiff: +340, age: 25, bestRank: 18 },
  { rank: 19, name: "Danielle Collins", country: "USA", flag: "🇺🇸", points: 1930, pointsDiff: -110, age: 30, bestRank: 7 },
  { rank: 20, name: "Markéta Vondroušová", country: "Czechy", flag: "🇨🇿", points: 1790, pointsDiff: -220, age: 24, bestRank: 8 },
];

// ─── Live Matches ─────────────────────────────────────────────────────────────

export interface Set {
  p1: number;
  p2: number;
}

export interface LiveMatch {
  id: string;
  tournament: string;
  surface: "Hard" | "Clay" | "Grass";
  round: string;
  player1: string;
  player2: string;
  flag1: string;
  flag2: string;
  sets: Set[];
  currentGame: string;
  server: 1 | 2;
  status: "live" | "finished" | "upcoming";
  startTime: string;
  stats: {
    aces: [number, number];
    doubleFaults: [number, number];
    firstServe: [number, number];
    winners: [number, number];
    errors: [number, number];
    breakPoints: [number, number];
  };
}

export const liveMatches: LiveMatch[] = [
  {
    id: "m1",
    tournament: "Roland Garros",
    surface: "Clay",
    round: "Ćwierćfinał",
    player1: "C. Alcaraz",
    player2: "H. Hurkacz",
    flag1: "🇪🇸",
    flag2: "🇵🇱",
    sets: [{ p1: 6, p2: 4 }, { p1: 3, p2: 5 }],
    currentGame: "40-30",
    server: 2,
    status: "live",
    startTime: "14:00",
    stats: {
      aces: [8, 12],
      doubleFaults: [2, 3],
      firstServe: [68, 71],
      winners: [34, 28],
      errors: [22, 31],
      breakPoints: [3, 5],
    },
  },
  {
    id: "m2",
    tournament: "Roland Garros",
    surface: "Clay",
    round: "Ćwierćfinał",
    player1: "I. Świątek",
    player2: "A. Sabalenka",
    flag1: "🇵🇱",
    flag2: "🇧🇾",
    sets: [{ p1: 7, p2: 5 }, { p1: 6, p2: 3 }],
    currentGame: "",
    server: 1,
    status: "finished",
    startTime: "11:00",
    stats: {
      aces: [4, 9],
      doubleFaults: [1, 4],
      firstServe: [74, 65],
      winners: [42, 35],
      errors: [18, 29],
      breakPoints: [6, 2],
    },
  },
  {
    id: "m3",
    tournament: "Queens Club",
    surface: "Grass",
    round: "Półfinał",
    player1: "J. Draper",
    player2: "T. Fritz",
    flag1: "🇬🇧",
    flag2: "🇺🇸",
    sets: [{ p1: 4, p2: 6 }, { p1: 6, p2: 4 }, { p1: 2, p2: 1 }],
    currentGame: "15-40",
    server: 1,
    status: "live",
    startTime: "16:30",
    stats: {
      aces: [14, 11],
      doubleFaults: [3, 2],
      firstServe: [63, 69],
      winners: [29, 31],
      errors: [27, 24],
      breakPoints: [4, 6],
    },
  },
  {
    id: "m4",
    tournament: "Bad Homburg Open",
    surface: "Grass",
    round: "Finał",
    player1: "E. Rybakina",
    player2: "C. Gauff",
    flag1: "🇰🇿",
    flag2: "🇺🇸",
    sets: [{ p1: 6, p2: 7 }, { p1: 3, p2: 2 }],
    currentGame: "30-30",
    server: 2,
    status: "live",
    startTime: "15:00",
    stats: {
      aces: [7, 6],
      doubleFaults: [3, 1],
      firstServe: [71, 68],
      winners: [27, 24],
      errors: [20, 18],
      breakPoints: [3, 4],
    },
  },
  {
    id: "m5",
    tournament: "Roland Garros",
    surface: "Clay",
    round: "Półfinał",
    player1: "J. Sinner",
    player2: "C. Ruud",
    flag1: "🇮🇹",
    flag2: "🇳🇴",
    sets: [],
    currentGame: "",
    server: 1,
    status: "upcoming",
    startTime: "20:15",
    stats: {
      aces: [0, 0],
      doubleFaults: [0, 0],
      firstServe: [0, 0],
      winners: [0, 0],
      errors: [0, 0],
      breakPoints: [0, 0],
    },
  },
];

// ─── News ─────────────────────────────────────────────────────────────────────

export type ContentBlock =
  | { type: "lead"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; author: string };

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: "ATP" | "WTA" | "Roland Garros" | "Wimbledon" | "Transfer" | "Polska" | "Juniorzy";
  date: string;
  readTime: number;
  imageQuery: string;
  featured?: boolean;
  author: string;
  authorRole?: string;
  content: ContentBlock[];
}

export const newsArticles: NewsArticle[] = [
  {
    id: "n1",
    title: "Swiatek triumfuje w Paryzu — czwarty tytul Roland Garros z rzedu",
    excerpt: "Iga Swiatek pokonala Aryne Sabalenke 7-5, 6-3 w finalowym meczu Roland Garros, zdobywajac swoj czwarty kolejny tytul w Paryzu. To historyczne osiagniecie stawia ja w gronie najwiekszych legend kortow ziemnych.",
    category: "Roland Garros",
    date: "2026-06-02",
    readTime: 4,
    imageQuery: "tennis court paris",
    featured: true,
    author: "Marcin Kowalski",
    authorRole: "Redaktor naczelny",
    content: [
      { type: "lead", text: "Iga Swiatek zapisala sie na kartach historii tenisa. Wygrywajac Roland Garros 2026, stala sie pierwsza zawodniczka od czasów Steffi Graf, ktora zgarnela cztery kolejne tytuly na kortach im. Rolanda Garrosa." },
      { type: "paragraph", text: "Finałowy mecz z Aryna Sabalenka rozpoczal sie w napietej atmosferze. Bialorusinka, ktora wczesniej w turnieju eliminowala kolejne rywalki bez straty seta, przystapila do finalu jako powaznie traktowana pretendentka. Jednak Swiatek od pierwszej wymiany dyktowala tempo gry, wykorzystujac charakterystyczna dla siebie kombinacje precyzyjnego topspinu z glebokim prowadzeniem pilki." },
      { type: "heading", text: "Kluczowe momenty finalu" },
      { type: "paragraph", text: "Pierwszy set przebiegal pod dyktando obu zawodniczek na zmiane. Przy stanie 5:5 Swiatek odegrac przelomowego breaka — seria czterech punktow z rzedu zakonczona mistrzowskim forhendem po linii wstrzasnela Sabalenka. Polka dokonczyla seta bez straty punktu przy swoim serwisie, triumfujac 7:5." },
      { type: "quote", text: "Wiedzialem, ze mam dzis dobry dzien na korcie. Poczulam sie lekko, wolno — jak zawsze kiedy gram swoj najlepszy tenis tutaj, w Paryzu.", author: "Iga Swiatek, po finale" },
      { type: "paragraph", text: "Drugi set byl demonstracja absolutnej dominacji. Swiatek wygenerovala 18 winnerow przy zaledwie 3 niewymuszone bledy — statystyki godne profesjonalnego rozdania na najwyzszym poziomie. Sabalenka, widzac ze nie ma recepty na forme Polki, probowala serwisu placasterskiego, jednak Swiatek odpowiadala returnem z sila i precyzja." },
      { type: "heading", text: "Historyczny kontekst osiagniecia" },
      { type: "paragraph", text: "Cztery kolejne tytuly Roland Garros to wynik, ktory ostatnio osiagnela Steffi Graf w latach 1987-1990. Swiatek ma dopiero 24 lata i wedlug ekspertow jest w szczycie swoich mozliwosci fizycznych i mentalnych. Pytanie nie brzmi juz czy zdola dobiec do 6 tytulow Chris Evert, ale kiedy to nastapi." },
      { type: "paragraph", text: "Nagroda za zwyciestwo wyniosla 2,4 miliona euro. Polka po ceremonii wreczenia trofeum udala sie na wywiad dla Canal+, gdzie z dobrze znaym jej usmiechem stwierdzila, ze 'trawa tez moze byc przyjazna'." },
    ],
  },
  {
    id: "n2",
    title: "Alcaraz vs Hurkacz: Spektakularny mecz na korcie Phillipe Chatrier",
    excerpt: "Carlos Alcaraz rozgrywal jeden z najlepszych meczow sezonu przeciwko Hubertowi Hurkaczowi. Polak zaskoczyL Hiszpana swietnym returnem, doprowadzajac do trzeciego seta.",
    category: "Roland Garros",
    date: "2026-06-02",
    readTime: 3,
    imageQuery: "tennis player action",
    author: "Anna Nowak",
    authorRole: "Korespondent Roland Garros",
    content: [
      { type: "lead", text: "Cwierc-final Roland Garros pomiedzy Carlosem Alcarazem a Hubertem Hurkaczem dostarczyl kibicom emocji na poziomie, jakiego nie widziano na Chatrier od lat." },
      { type: "paragraph", text: "Mecz rozpoczal sie od wyrownanych wymian. Alcaraz serwujac swobodnie na 220 km/h, szybko zdobyl breaka w pierwszym secie. Hurkacz jednak odpowiedzial serie znakomitych returnerow — Polak, znany ze swietnego forehandowego crossu, kilkakrotnie wprawil w oslupienieTribuny Court Phillipe-Chatrier." },
      { type: "quote", text: "Hubert gral dzis swietnie. To byl wyjatkowo trudny mecz — musialem byc w 100% skupiony przez kazda wymiane.", author: "Carlos Alcaraz, po meczu" },
      { type: "heading", text: "Trzeci set — show na ziemi" },
      { type: "paragraph", text: "Po sile zwyciestwa przez Alcaraza 6:4, 4:6, Hurkacz doprowadzil do dramatycznego trzeciego seta. Przy stanie 5:5 kibice wstali z krzeseln, gdy Polak obronial trzy break pointy z rzedu. Ostatecznie to Alcaraz zamknal seta na swoim serwisie 7:5, odsylajac Hurkacza z turnieju." },
      { type: "paragraph", text: "Mimo porazki Hurkacz podniosl swoj ranking — awansowal z miejsca 14. na 13. Eksperci sa zgodni, ze gra Polaka na tegorocznym Roland Garros to jego najlepszy wynik na paryskiej glinie od poczatku kariery." },
    ],
  },
  {
    id: "n3",
    title: "Hurkacz awansuje do czolowki ATP — 13. miejsce w rankingu",
    excerpt: "Po swietnej passie turniejowej Hubert Hurkacz umocnil sie na 13. pozycji w rankingu ATP Race. Polak gra najlepszy tenis w karierze i celuje w Top 10 przed Wimbledon.",
    category: "Polska",
    date: "2026-06-02",
    readTime: 2,
    imageQuery: "tennis champion trophy",
    author: "Piotr Wisniewski",
    authorRole: "Dziennikarz sportowy",
    content: [
      { type: "lead", text: "Hubert Hurkacz jest dzis na 13. miejscu rankingu ATP — najwyzej w swojej karierze w tym momencie sezonu. Wyniki z paryskiej gliny moga byc przedsmakiem tego, co czeka nas na trawie Wimbledonu." },
      { type: "paragraph", text: "Sezon 2026 to dla Hurkacza przelamanie. Po kontuzji barku w 2025 roku wielu ekspertow watpilo w rychly powrot Polaka do czolowki. Jednak wroclaw z determinacja i zmodyfikowanym planem treningowym przygotowanym przez sztab z Craigiem Boyntonem na czele." },
      { type: "quote", text: "Pracujemy ciezko, by poprawic gre od podstaw. Widzialem progres przez caly sezon i teraz to procentuje.", author: "Hubert Hurkacz" },
      { type: "heading", text: "Cel: Top 10 przed Wimbledon" },
      { type: "paragraph", text: "Przed Wimbledon Hurkacz bedzie bronit stosunkowo niewielu punktow — to oznacza, ze dobre wyniki na trawie moga wyniesc go powyzej granicy Top 10. Wimbledon 2025 przeszedl dla niego bezbolesnie po kontuzji, wiec punktow do obrony jest minimalnie. Wszystko to uklada sie w obiecujacy scenariusz." },
    ],
  },
  {
    id: "n4",
    title: "Sinner broni pozycji numer jeden — analiza jego dominacji",
    excerpt: "Jannik Sinner od ponad roku utrzymuje pozycje lidera rankingu ATP. Eksperci analizuja taktyczne i fizyczne przygotowanie Wlocha, ktore pozwalaja mu wygrywac nawet trudne mecze.",
    category: "ATP",
    date: "2026-06-01",
    readTime: 6,
    imageQuery: "tennis serve motion",
    author: "Marcin Kowalski",
    authorRole: "Redaktor naczelny",
    content: [
      { type: "lead", text: "Jannik Sinner to numer jeden swiatowego tenisa od 14 miesiecy. Wloch w tym czasie wygral dwa Wielkiemy Szlemy, trzy Mastersy 1000 i osiagnal bilans 72 wygranych meczow na 11 przegranych. Co stoi za ta dominacja?" },
      { type: "heading", text: "Fizyczne podstawy gry" },
      { type: "paragraph", text: "Sinner pracuje z jednym z najbardziej zaawansowanych sztabow fizycznych w tourze. Jego trener Simone Vagnozzi wspolpracuje z Darrenim Cahillem, ktorzy wspólnie zbudowali zawodnika o wyjatkowych umiejetnosciach regeneracji. Wloch potrafi grac mecze przez pieciodniowe tury turniejow bez widocznego spadku wydajnosci." },
      { type: "paragraph", text: "Klucz do jego gry to backhand. Uderzenie obureczne generuje sredni spin na poziomie 3800 rpm — dla porownania srednia tourowa to okolo 2900 rpm. To oznacza pilke, ktora po odbiciu unosi sie gwaltownie, wybijajac rywala z rytmu." },
      { type: "quote", text: "Sinner gra tenis przyszlosci. Jego precyzja i szybkosc decyzji sa na poziomie, jakiego nie widzialem od Djokovica w szczytowej formie.", author: "Mats Wilander, ekspert Eurosportu" },
      { type: "heading", text: "Mentalnosc lidera" },
      { type: "paragraph", text: "Poza fizycznoscia, co wyroznia Sinnera to spokojna pewnosc siebie. W wywiadach nigdy nie atakuje rywali, nie narzeka na warunki. Skupia sie wylacznie na tym, co moze kontrolowac. To rzadka cecha wsrod tenisistow na szczycie, gdzie presja mediow i kibicow potrafi rozlozych nawet zawodnikow z bogatym doswiadczeniem." },
      { type: "paragraph", text: "Analitycy z ATP wskazuja, ze Sinner wygrywa 71% punktow przy swoim pierwszym serwisie i az 58% przy drugim — drugi najlepszy wynik w tourze. Oznacza to, ze rywal musi byc doskonaly przez caly mecz, nie ma miejca na chwile slabosci." },
    ],
  },
  {
    id: "n5",
    title: "Gauff odrabia straty — imponujacy sezon Amerykanki",
    excerpt: "Coco Gauff notuje imponujace wyniki w 2026 roku. Aktualny sezon moze byc jej najlepszym — juz teraz przekroczyla liczbe zwyciezstw z calego 2025 roku.",
    category: "WTA",
    date: "2026-06-01",
    readTime: 3,
    imageQuery: "woman tennis player",
    author: "Katarzyna Malinowska",
    authorRole: "Korespondent WTA",
    content: [
      { type: "lead", text: "Po trudnym 2025 roku Coco Gauff wrocila z wyraznym krokiem do przodu. Americanka ma juz 47 zwyciezstw w 2026 roku — o cztery wiecej niz przez caly ubiegly sezon." },
      { type: "paragraph", text: "Sezon 2025 byl dla Gauff rokiem wyjatkowo trudnym psychicznie. Po pierwszym wielkim szlemie w 2023 roku (US Open) kiedy wygrala jako nastolatka, oczekiwania byly kolosalne. W 2025 odpadala wczesnie w kilku waznych turniejach, co media okrzykly 'kryzysem'. Sama zawodniczka przyznala pozniej, ze walczyla z wypaleniem i przemeczeniem." },
      { type: "quote", text: "Potrzebowalam przerwy, by przypomniec sobie dlaczego kocham tenis. Teraz grams dla siebie, nie dla wynikow.", author: "Coco Gauff, wywiad dla Tennis Channel" },
      { type: "heading", text: "Nowy styl gry" },
      { type: "paragraph", text: "Wspolpracujac z nowym trenerem Brad Gilbertem, Gauff zmienila styl gry — teraz czesciej podchodzi do siatki i uderza woleje. To zmiana niemala jak na kortach wta, gdzie gra z linii bazowej jest standardem. Jednak wyniki mowia same za siebie: 78% zwyciezstw w trzecich setach w tym sezonie to najlepszy wynik w tourze." },
    ],
  },
  {
    id: "n6",
    title: "Wimbledon coraz blizej — trawa przygotowana na najwyzszym poziomie",
    excerpt: "Organizatorzy Wimbledonu informuja, ze trawiaste korty sa w rekordowej formie. Zima 2025/2026 okazala sie idealna dla traw kortowych.",
    category: "Wimbledon",
    date: "2026-05-31",
    readTime: 2,
    imageQuery: "wimbledon grass court",
    author: "James Williams",
    authorRole: "Korespondent Wimbledon",
    content: [
      { type: "lead", text: "Za cztery tygodnie swiat tenisa przeniesie sie na trawe All England Club. Tym razem organizatorzy przekonuja, ze korty sa w historycznie najlepszej kondycji." },
      { type: "paragraph", text: "Szef departamentu nawierzchni Wimbledonu Neil Stubley pokazal mediom wyniki testow gestosci trawy. Srednia gestosc wyniosla 96 roslin na 10 cm kwadratowych — o 12% wiecej niz w roku poprzednim. 'To efekt wyjatkowej pogody i nowego systemu nawadniania zainstalowanego jesienia 2025' — powiedzial Stubley." },
      { type: "quote", text: "Jeszcze nigdy korty nie wygladaly tak dobrze w tym momencie roku. Jestem niezwykle dumny z naszego zespolu.", author: "Neil Stubley, szef nawierzchni AELTC" },
      { type: "paragraph", text: "Wimbledon 2026 startuje 29 czerwca i potrwa do 12 lipca. Pula nagrod po raz pierwszy przekroczy 60 milionow funtow — wzrost o 8% w stosunku do ubieglego roku." },
    ],
  },
  {
    id: "n7",
    title: "Junior Maja Chwalinska — nowe nadzieje polskiego tenisa",
    excerpt: "Siedemnastolatka Maja Chwalinska wygrala prestizowy turniej juniorski w Barcelonie, pokonujac w finale rywalke z Czech. Trenerzy widza w niej nastepczyni Swiatek.",
    category: "Juniorzy",
    date: "2026-05-31",
    readTime: 3,
    imageQuery: "young tennis player",
    author: "Piotr Wisniewski",
    authorRole: "Dziennikarz sportowy",
    content: [
      { type: "lead", text: "Maja Chwalinska, 17-letnia zawodniczka z Wroclawia, wygrala turniej ITF Grade A w Barcelonie — jeden z najbardziej prestizowych juniorskich turniejow w Europie. Eksperci porownuja jej potencjal z mloda Iga Swiatek." },
      { type: "paragraph", text: "Final przeciwko czeskiej Mirce Novotnej zakonczyl sie wynikiem 6:3, 6:4 dla Polki. Chwalinska przez caly mecz demonstrowala dojrzalosc daleko wykraczajaca poza jej wiek — chladna glowe pod presja, wyborne poruszanie sie po korcie i wielostronny atak." },
      { type: "quote", text: "Maja ma wszystko, czego potrzeba by grac na najwyzszym poziomie. Technike, glowe i charakter. Brakuje tylko lat doswiadczenia, ale one przyjda.", author: "Tomasz Wiktorowski, trener Igi Swiatek (komentarz po finalu)" },
      { type: "heading", text: "Droga przez turniej" },
      { type: "paragraph", text: "Chwalinska nie stracila seta przez caly turniej. W polfinale wyeliminowala rozstawiona z numerem 2 Rosjanka, wygrywajac 7:5 w decydujacym secie. Swoim wynikiem w Barcelonie wskoczyla do top 15 rankingu juniorek WTA." },
      { type: "paragraph", text: "Polski Zwiazek Tenisowy zapowiedzial, ze Chwalinska dostanie zgode na gre w czeskim kwalifikacjach do glownej drabinki Wimbledonu. Jesli wejdzie do glownej drabinki, bedzie najmlodsza Polka na Wimbledonie od dekad." },
    ],
  },
  {
    id: "n8",
    title: "Roland Garros 2026: Rekordowa liczba kibicow na trybunach",
    excerpt: "Tegoroczny Roland Garros przyciagnal ponad 550 000 widzow w ciagu dwoch tygodni — nowy rekord frekwencji w historii turnieju.",
    category: "Roland Garros",
    date: "2026-05-30",
    readTime: 2,
    imageQuery: "tennis stadium crowd",
    author: "Anna Nowak",
    authorRole: "Korespondent Roland Garros",
    content: [
      { type: "lead", text: "Roland Garros 2026 zakonczyl sie nie tylko sportowym spektaklem, ale tez rekordowym wynikiem frekwencyjnym — 552 000 kibicow przez dwa tygodnie turnieju." },
      { type: "paragraph", text: "Poprzedni rekord z 2024 roku wyniosl 540 000 widzow. Wzrost to efekt powiekszenia pojemnosci Saut du Loup — nowego kortu oddanego do uzytku w 2025 roku, ktory pomiescil dodatkowe 3 000 miejsc na kazdy dzien turnieju." },
      { type: "quote", text: "Widzielismy kibicow z 140 krajow. Roland Garros staje sie coraz bardziej globalnym wydarzeniem, nie tylko europejskim.", author: "Guy Forget, dyrektor turnieju" },
      { type: "paragraph", text: "Organizatorzy rozwaznaja dalsze inwestycje — plan zaklada powiekszenie glownego kortu Court Philippe-Chatrier o kolejne 2 000 miejsc do 2028 roku. Bedzie to wymagalo modernizacji zadaszenia, ktore zostalo zainstalowane w 2020 roku." },
    ],
  },
  {
    id: "n9",
    title: "Zverev po nieudanym Roland Garros — zmiana przygotan przed Wimbledon",
    excerpt: "Alexander Zverev odpadl w cwierc-finale Roland Garros, co zaskoczyldo wielu ekspertow. Niemiec zapowiada intensywna prace na trawie przed Wimbledon.",
    category: "ATP",
    date: "2026-05-30",
    readTime: 3,
    imageQuery: "tennis training court",
    author: "Hans Mueller",
    authorRole: "Korespondent ATP",
    content: [
      { type: "lead", text: "Alexander Zverev po odpadnieciu w cwierfinale Roland Garros podjal nieoczekiwana decyzje — zamiast urlopu, bezposrednio po Paryzu udaje sie na tygodniowe zgrupowanie na trawianych kortach w Halle." },
      { type: "paragraph", text: "Zverev od kilku sezonow walczy z wlasnym ograniczeniem — mimo ze jest jednym z najlepszych tenisistow swiata, Wimbledon tradycyjnie sprawia mu trudnosci. W ostatnich pieciu edycjach najdalej dotarl do cwierfinalu." },
      { type: "quote", text: "Wiedzialem juz od zeszlego roku, ze moje przygotowania do trawy musza byc zupelnie inne. W tym roku naprawde sie do tego zabieramy.", author: "Alexander Zverev" },
      { type: "heading", text: "Nowy plan na trawe" },
      { type: "paragraph", text: "Wedlug informacji Eurosportu, Zverev wspolpracuje z Federica Pezzolato, specjalista od gry siatkoweja i woleja. To zmiana stylistyczna — Niemiec, znany z gry z linii bazowej, zamierza czesciej wychodzic do siatki na trawie." },
      { type: "paragraph", text: "Jego pierwszy test bedzie ATP 500 w Halle (15-21 czerwca), gdzie Zverev wygrywal w 2021 i 2022 roku. Potem bezposrednio Wimbledon. Eksperci pytaja: czy 28-letni Zverev zdola w koncu zadomowic sie na najwazniejszych kortach trawianych swiata?" },
    ],
  },
  {
    id: "n10",
    title: "Rybakina i Paolini — nowe gwiazdy kortow trawianych",
    excerpt: "Elena Rybakina i Jasmine Paolini imponuja forma na trawie. Obie zawodniczki sa faworytkami Wimbledonu wedlug ekspertow.",
    category: "WTA",
    date: "2026-05-29",
    readTime: 3,
    imageQuery: "tennis women doubles",
    author: "Katarzyna Malinowska",
    authorRole: "Korespondent WTA",
    content: [
      { type: "lead", text: "Przed Wimbledonem dwie zawodniczki wyrozniaja sie w statystykach gry na trawie: Elena Rybakina i Jasmine Paolini. Obie moga byc najgrozbniejszymi rywalkami Swiatek w Londynie." },
      { type: "paragraph", text: "Rybakina to aktualna mistrzyni Wimbledonu (2022) i finalistka (2023). Na trawie prezentuje swoj najlepszy tenis — serwis Kazaszki jest wyjatkowo niebezpieczny na szybkiej nawierzchni, generujac srednie 192 km/h i wysoki procent asow." },
      { type: "heading", text: "Paolini — niespodziewana kandydatka" },
      { type: "paragraph", text: "Wloska tenisistka Jasmine Paolini niespodziewanie wygrala Bad Homburg Open w 2025 roku i od tamtej chwili regularnie gra polfinaly na trawie. Jej niski wzrost (163 cm) zamiast byc przeszkoda, pomaga jej w szybkich zmianach kierunku i precyzyjnym returnowaniu nawet przy silnym serwisie." },
      { type: "quote", text: "Jasmine to dowod, ze w tenisie nie ma jednego modelu sukcesu. Gra inteligentnie i odwazne — to wystarcza na najwyzszym poziomie.", author: "Martina Navratilova, komentarz dla BBC Sport" },
      { type: "paragraph", text: "Wedlug rankingu maszyny prognozujacej wyniki ATP/WTA, szanse Rybakiny na tytul Wimbledonu wynoszaz 22%, Swiatek 19%, Paolini 14%. To niespodziewanie wyrownana trzyosobowa stawka faworytek." },
    ],
  },
];

// ─── Tournaments / Calendar ───────────────────────────────────────────────────

export interface Tournament {
  id: string;
  name: string;
  location: string;
  country: string;
  flag: string;
  surface: "Hard" | "Clay" | "Grass" | "Indoor Hard";
  category: "Grand Slam" | "ATP 1000" | "ATP 500" | "ATP 250" | "WTA 1000" | "WTA 500" | "WTA 250";
  startDate: string;
  endDate: string;
  prize: string;
  status: "live" | "upcoming" | "completed";
  liveStreamUrl?: string;
  imageQuery: string;
}

export const tournaments: Tournament[] = [
  {
    id: "t1",
    name: "Roland Garros",
    location: "Paryż",
    country: "Francja",
    flag: "🇫🇷",
    surface: "Clay",
    category: "Grand Slam",
    startDate: "2026-05-25",
    endDate: "2026-06-08",
    prize: "53 478 000 €",
    status: "live",
    liveStreamUrl: "https://www.rolandgarros.com",
    imageQuery: "paris tennis roland garros",
  },
  {
    id: "t2",
    name: "Queens Club Championships",
    location: "Londyn",
    country: "Wielka Brytania",
    flag: "🇬🇧",
    surface: "Grass",
    category: "ATP 500",
    startDate: "2026-06-09",
    endDate: "2026-06-15",
    prize: "2 961 225 $",
    status: "upcoming",
    liveStreamUrl: "https://www.atptour.com",
    imageQuery: "grass court tennis london",
  },
  {
    id: "t3",
    name: "Bad Homburg Open",
    location: "Bad Homburg",
    country: "Niemcy",
    flag: "🇩🇪",
    surface: "Grass",
    category: "WTA 500",
    startDate: "2026-06-09",
    endDate: "2026-06-15",
    prize: "791 720 $",
    status: "upcoming",
    imageQuery: "grass court tennis germany",
  },
  {
    id: "t4",
    name: "Halle Open",
    location: "Halle",
    country: "Niemcy",
    flag: "🇩🇪",
    surface: "Grass",
    category: "ATP 500",
    startDate: "2026-06-09",
    endDate: "2026-06-15",
    prize: "2 371 375 €",
    status: "upcoming",
    imageQuery: "tennis court grass open",
  },
  {
    id: "t5",
    name: "Wimbledon",
    location: "Londyn",
    country: "Wielka Brytania",
    flag: "🇬🇧",
    surface: "Grass",
    category: "Grand Slam",
    startDate: "2026-06-29",
    endDate: "2026-07-12",
    prize: "50 000 000 £",
    status: "upcoming",
    liveStreamUrl: "https://www.wimbledon.com",
    imageQuery: "wimbledon tennis court",
  },
  {
    id: "t6",
    name: "Mallorca Championships",
    location: "Mallorca",
    country: "Hiszpania",
    flag: "🇪🇸",
    surface: "Grass",
    category: "WTA 250",
    startDate: "2026-06-16",
    endDate: "2026-06-21",
    prize: "280 000 $",
    status: "upcoming",
    imageQuery: "mallorca tennis court",
  },
  {
    id: "t7",
    name: "Eastbourne International",
    location: "Eastbourne",
    country: "Wielka Brytania",
    flag: "🇬🇧",
    surface: "Grass",
    category: "WTA 500",
    startDate: "2026-06-22",
    endDate: "2026-06-27",
    prize: "871 820 $",
    status: "upcoming",
    imageQuery: "tennis tournament uk",
  },
  {
    id: "t8",
    name: "US Open",
    location: "Nowy Jork",
    country: "USA",
    flag: "🇺🇸",
    surface: "Hard",
    category: "Grand Slam",
    startDate: "2026-08-24",
    endDate: "2026-09-07",
    prize: "65 000 000 $",
    status: "upcoming",
    liveStreamUrl: "https://www.usopen.org",
    imageQuery: "us open tennis new york",
  },
  {
    id: "t9",
    name: "Australian Open",
    location: "Melbourne",
    country: "Australia",
    flag: "🇦🇺",
    surface: "Hard",
    category: "Grand Slam",
    startDate: "2026-01-12",
    endDate: "2026-01-26",
    prize: "86 500 000 AUD",
    status: "completed",
    imageQuery: "australian open melbourne",
  },
  {
    id: "t10",
    name: "Madrid Open",
    location: "Madryt",
    country: "Hiszpania",
    flag: "🇪🇸",
    surface: "Clay",
    category: "ATP 1000",
    startDate: "2026-04-28",
    endDate: "2026-05-11",
    prize: "8 354 625 $",
    status: "completed",
    imageQuery: "madrid clay court tennis",
  },
  {
    id: "t11",
    name: "Italian Open",
    location: "Rzym",
    country: "Włochy",
    flag: "🇮🇹",
    surface: "Clay",
    category: "ATP 1000",
    startDate: "2026-05-05",
    endDate: "2026-05-18",
    prize: "8 354 625 $",
    status: "completed",
    imageQuery: "rome tennis clay court",
  },
  {
    id: "t12",
    name: "Cincinnati Open",
    location: "Cincinnati",
    country: "USA",
    flag: "🇺🇸",
    surface: "Hard",
    category: "ATP 1000",
    startDate: "2026-08-10",
    endDate: "2026-08-23",
    prize: "8 800 000 $",
    status: "upcoming",
    imageQuery: "cincinnati tennis hard court",
  },
];

// ─── Today's Matches ──────────────────────────────────────────────────────────

export interface TodayMatch {
  id: string;
  tournamentId: string;
  tournament: string;
  court: string;
  time: string;
  player1: string;
  player2: string;
  flag1: string;
  flag2: string;
  score?: string;
  status: "live" | "upcoming" | "finished";
}

export const todayMatches: TodayMatch[] = [
  {
    id: "tm1",
    tournamentId: "t1",
    tournament: "Roland Garros",
    court: "Court Phillipe Chatrier",
    time: "11:00",
    player1: "I. Świątek",
    player2: "A. Sabalenka",
    flag1: "🇵🇱",
    flag2: "🇧🇾",
    score: "7-5, 6-3",
    status: "finished",
  },
  {
    id: "tm2",
    tournamentId: "t1",
    tournament: "Roland Garros",
    court: "Court Phillipe Chatrier",
    time: "14:00",
    player1: "C. Alcaraz",
    player2: "H. Hurkacz",
    flag1: "🇪🇸",
    flag2: "🇵🇱",
    score: "6-4, 3-5*",
    status: "live",
  },
  {
    id: "tm3",
    tournamentId: "t1",
    tournament: "Roland Garros",
    court: "Court Suzanne Lenglen",
    time: "16:00",
    player1: "D. Medvedev",
    player2: "H. Rune",
    flag1: "🇷🇺",
    flag2: "🇩🇰",
    status: "upcoming",
  },
  {
    id: "tm4",
    tournamentId: "t1",
    tournament: "Roland Garros",
    court: "Court Phillipe Chatrier",
    time: "20:15",
    player1: "J. Sinner",
    player2: "C. Ruud",
    flag1: "🇮🇹",
    flag2: "🇳🇴",
    status: "upcoming",
  },
  {
    id: "tm5",
    tournamentId: "t3",
    tournament: "Bad Homburg Open",
    court: "Centre Court",
    time: "15:00",
    player1: "E. Rybakina",
    player2: "C. Gauff",
    flag1: "🇰🇿",
    flag2: "🇺🇸",
    score: "6-7, 3-2*",
    status: "live",
  },
];

// ─── Videos ───────────────────────────────────────────────────────────────────

export interface Video {
  id: string;
  title: string;
  tournament: string;
  players: string;
  duration: string;
  youtubeSearch: string;
  imageQuery: string;
  date: string;
  category: "Highlights" | "Full Match" | "Interview" | "Analysis";
}

export const videos: Video[] = [
  {
    id: "v1",
    title: "Świątek vs Sabalenka — skrót meczu finałowego Roland Garros 2026",
    tournament: "Roland Garros 2026",
    players: "I. Świątek vs A. Sabalenka",
    duration: "8:24",
    youtubeSearch: "Swiatek Sabalenka Roland Garros 2026 final highlights",
    imageQuery: "paris tennis stadium sunset",
    date: "2026-06-02",
    category: "Highlights",
  },
  {
    id: "v2",
    title: "Alcaraz — najlepsze zagrania Roland Garros 2026",
    tournament: "Roland Garros 2026",
    players: "C. Alcaraz",
    duration: "5:47",
    youtubeSearch: "Alcaraz best shots Roland Garros 2026",
    imageQuery: "tennis player forehand clay",
    date: "2026-06-01",
    category: "Highlights",
  },
  {
    id: "v3",
    title: "Hurkacz wywiad po meczu: 'To był mój najlepszy mecz na ziemi'",
    tournament: "Roland Garros 2026",
    players: "H. Hurkacz",
    duration: "3:12",
    youtubeSearch: "Hurkacz interview Roland Garros 2026",
    imageQuery: "tennis interview press conference",
    date: "2026-06-02",
    category: "Interview",
  },
  {
    id: "v4",
    title: "Sinner vs Medvedev — finał Australian Open 2026",
    tournament: "Australian Open 2026",
    players: "J. Sinner vs D. Medvedev",
    duration: "12:05",
    youtubeSearch: "Sinner Medvedev Australian Open 2026 final",
    imageQuery: "melbourne tennis arena night",
    date: "2026-01-26",
    category: "Highlights",
  },
  {
    id: "v5",
    title: "Analiza taktyczna: Dlaczego Świątek jest niepokonana na ziemi?",
    tournament: "Roland Garros 2026",
    players: "I. Świątek",
    duration: "9:33",
    youtubeSearch: "Swiatek clay court tactics analysis 2026",
    imageQuery: "tennis coach tactics analysis",
    date: "2026-05-30",
    category: "Analysis",
  },
  {
    id: "v6",
    title: "Gauff vs Rybakina — skrót półfinału Bad Homburg",
    tournament: "Bad Homburg Open 2026",
    players: "C. Gauff vs E. Rybakina",
    duration: "6:18",
    youtubeSearch: "Gauff Rybakina Bad Homburg 2026 highlights",
    imageQuery: "grass court tennis match",
    date: "2026-06-01",
    category: "Highlights",
  },
  {
    id: "v7",
    title: "Draper — nowa gwiazda brytyjskiego tenisa na trawie",
    tournament: "Queens Club 2026",
    players: "J. Draper",
    duration: "4:55",
    youtubeSearch: "Jack Draper Queens Club 2026",
    imageQuery: "tennis grass court action",
    date: "2026-05-29",
    category: "Highlights",
  },
  {
    id: "v8",
    title: "Top 10 zagrań tygodnia — Roland Garros, tydzień 2",
    tournament: "Roland Garros 2026",
    players: "Różni zawodnicy",
    duration: "3:40",
    youtubeSearch: "Roland Garros 2026 top 10 shots week 2",
    imageQuery: "tennis overhead shot clay",
    date: "2026-05-31",
    category: "Highlights",
  },
];

// ─── Junior Players ────────────────────────────────────────────────────────────

export const juniorAtpPlayers: Player[] = [
  { rank: 1, name: "Martin Landaluce", country: "Hiszpania", flag: "🇪🇸", points: 520, pointsDiff: +40, age: 17, bestRank: 1 },
  { rank: 2, name: "Emilio Nava", country: "USA", flag: "🇺🇸", points: 480, pointsDiff: -20, age: 18, bestRank: 2 },
  { rank: 3, name: "Luca Van Assche", country: "Francja", flag: "🇫🇷", points: 455, pointsDiff: +15, age: 17, bestRank: 3 },
  { rank: 4, name: "Kacper Żuk", country: "Polska", flag: "🇵🇱", points: 420, pointsDiff: +85, age: 16, bestRank: 4 },
  { rank: 5, name: "Coleman Wong", country: "Hong Kong", flag: "🇭🇰", points: 385, pointsDiff: +30, age: 17, bestRank: 5 },
  { rank: 6, name: "Jakub Menšík", country: "Czechy", flag: "🇨🇿", points: 360, pointsDiff: -45, age: 17, bestRank: 4 },
  { rank: 7, name: "Mika Brunold", country: "Szwajcaria", flag: "🇨🇭", points: 335, pointsDiff: +20, age: 18, bestRank: 7 },
  { rank: 8, name: "Shintaro Mochizuki", country: "Japonia", flag: "🇯🇵", points: 310, pointsDiff: +65, age: 17, bestRank: 8 },
];

export const juniorWtaPlayers: Player[] = [
  { rank: 1, name: "Maja Chwalińska", country: "Polska", flag: "🇵🇱", points: 560, pointsDiff: +120, age: 17, bestRank: 1 },
  { rank: 2, name: "Alina Korneeva", country: "Rosja", flag: "🇷🇺", points: 510, pointsDiff: -30, age: 17, bestRank: 2 },
  { rank: 3, name: "Lucie Havlickova", country: "Czechy", flag: "🇨🇿", points: 475, pointsDiff: +10, age: 18, bestRank: 3 },
  { rank: 4, name: "Matilda Mutavdzic", country: "Wielka Brytania", flag: "🇬🇧", points: 440, pointsDiff: +55, age: 17, bestRank: 4 },
  { rank: 5, name: "Brenda Fruhvirtova", country: "Czechy", flag: "🇨🇿", points: 405, pointsDiff: -15, age: 17, bestRank: 3 },
  { rank: 6, name: "Katarzyna Kawa Jr.", country: "Polska", flag: "🇵🇱", points: 370, pointsDiff: +90, age: 16, bestRank: 6 },
  { rank: 7, name: "Hannah Klugman", country: "Wielka Brytania", flag: "🇬🇧", points: 340, pointsDiff: +25, age: 16, bestRank: 7 },
  { rank: 8, name: "Nikola Bartunkova", country: "Czechy", flag: "🇨🇿", points: 315, pointsDiff: -40, age: 17, bestRank: 5 },
];

// ─── Surface colors & helpers ─────────────────────────────────────────────────

export const surfaceColors: Record<string, string> = {
  Clay: "bg-orange-100 text-orange-800 border-orange-200",
  Grass: "bg-green-100 text-green-800 border-green-200",
  Hard: "bg-blue-100 text-blue-800 border-blue-200",
  "Indoor Hard": "bg-purple-100 text-purple-800 border-purple-200",
};

export const categoryColors: Record<string, string> = {
  "Grand Slam": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "ATP 1000": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "ATP 500": "bg-sky-100 text-sky-800 border-sky-200",
  "ATP 250": "bg-slate-100 text-slate-700 border-slate-200",
  "WTA 1000": "bg-pink-100 text-pink-800 border-pink-200",
  "WTA 500": "bg-rose-100 text-rose-800 border-rose-200",
  "WTA 250": "bg-slate-100 text-slate-700 border-slate-200",
};
