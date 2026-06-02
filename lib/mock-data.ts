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
}

export const newsArticles: NewsArticle[] = [
  {
    id: "n1",
    title: "Świątek triumfuje w Paryżu — czwarty tytuł Roland Garros z rzędu",
    excerpt: "Iga Świątek pokonała Arynę Sabalenkę 7-5, 6-3 w finałowym meczu Roland Garros, zdobywając swój czwarty kolejny tytuł w Paryżu. To historyczne osiągnięcie stawia ją w gronie największych legend kortów ziemnych.",
    category: "Roland Garros",
    date: "2026-06-02",
    readTime: 4,
    imageQuery: "tennis court paris",
    featured: true,
    author: "Marcin Kowalski",
  },
  {
    id: "n2",
    title: "Alcaraz vs Hurkacz: Spektakularny mecz na korcie Phillipe Chatrier",
    excerpt: "Carlos Alcaraz rozgrywał jeden z najlepszych meczów sezonu przeciwko Hubertowi Hurkaczowi. Polak zaskoczyła Hiszpana świetnym returnem, doprowadzając do trzeciego seta.",
    category: "Roland Garros",
    date: "2026-06-02",
    readTime: 3,
    imageQuery: "tennis player action",
    author: "Anna Nowak",
  },
  {
    id: "n3",
    title: "Hurkacz awansuje do czołówki ATP — 13. miejsce w rankingu",
    excerpt: "Po świetnej passie turniejowej Hubert Hurkacz umocnił się na 13. pozycji w rankingu ATP Race. Polak gra najlepszy tenis w karierze i celuje w Top 10 przed Wimbledon.",
    category: "Polska",
    date: "2026-06-02",
    readTime: 2,
    imageQuery: "tennis champion trophy",
    author: "Piotr Wiśniewski",
  },
  {
    id: "n4",
    title: "Sinner broni pozycji numer jeden — analiza jego dominacji",
    excerpt: "Jannik Sinner od ponad roku utrzymuje pozycję lidera rankingu ATP. Eksperci analizują taktykę i fizyczne przygotowanie Włocha, które pozwalają mu wygrywać nawet trudne mecze.",
    category: "ATP",
    date: "2026-06-01",
    readTime: 6,
    imageQuery: "tennis serve motion",
    author: "Marcin Kowalski",
  },
  {
    id: "n5",
    title: "Gauff odrabia straty — imponujący sezon Amerykanki",
    excerpt: "Coco Gauff notuje imponujące wyniki w 2026 roku. Aktualny sezon może być jej najlepszym — już teraz przekroczyła liczbę zwycięstw z całego 2025 roku.",
    category: "WTA",
    date: "2026-06-01",
    readTime: 3,
    imageQuery: "woman tennis player",
    author: "Katarzyna Malinowska",
  },
  {
    id: "n6",
    title: "Wimbledon coraz bliżej — trawa przygotowana na najwyższym poziomie",
    excerpt: "Organizatorzy Wimbledonu informują, że trawiaste korty są w rekordowej formie. Zima 2025/2026 okazała się idealna dla traw kortowych.",
    category: "Wimbledon",
    date: "2026-05-31",
    readTime: 2,
    imageQuery: "wimbledon grass court",
    author: "James Williams",
  },
  {
    id: "n7",
    title: "Junior Maja Chwalińska — nowe nadzieje polskiego tenisa",
    excerpt: "Siedemnastolatka Maja Chwalińska wygrała prestiżowy turniej juniorski w Barcelonie, pokonując w finale rywalkę z Czechu. Trenerzy widzą w niej następczynię Świątek.",
    category: "Juniorzy",
    date: "2026-05-31",
    readTime: 3,
    imageQuery: "young tennis player",
    author: "Piotr Wiśniewski",
  },
  {
    id: "n8",
    title: "Roland Garros 2026: Rekordowa liczba kibiców na trybunach",
    excerpt: "Tegoroczny Roland Garros przyciągnął ponad 550 000 widzów w ciągu dwóch tygodni — nowy rekord frekwencji w historii turnieju. Organizatorzy rozważają rozszerzenie pojemności Stade Roland Garros.",
    category: "Roland Garros",
    date: "2026-05-30",
    readTime: 2,
    imageQuery: "tennis stadium crowd",
    author: "Anna Nowak",
  },
  {
    id: "n9",
    title: "Zverev po nieudanym Roland Garros — zmiana przygotowań przed Wimbledon",
    excerpt: "Alexander Zverev odpadł w ćwierćfinale Roland Garros, co zaskoczyło wielu ekspertów. Niemiec zapowiada intensywną pracę na trawie przed Wimbledon.",
    category: "ATP",
    date: "2026-05-30",
    readTime: 3,
    imageQuery: "tennis training court",
    author: "Hans Mueller",
  },
  {
    id: "n10",
    title: "Rybakina i Paolini — nowe gwiazdy kortów trawianych",
    excerpt: "Elena Rybakina i Jasmine Paolini imponują formą na trawie. Obie zawodniczki są faworytkami Wimbledonu według ekspertów.",
    category: "WTA",
    date: "2026-05-29",
    readTime: 3,
    imageQuery: "tennis women doubles",
    author: "Katarzyna Malinowska",
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
