import { defineField, defineType } from "sanity";

/**
 * Player profile (/zawodnicy/[slug]). Ranking, season stats, titles and recent
 * matches come from API-Tennis by `apiPlayerKey`; everything else is editorial.
 * New profiles are created by scripts/import-players.ts (top 100 ATP/WTA + all
 * ranked Polish players); the script never edits existing documents.
 */
export const playerType = defineType({
  name: "player",
  title: "Zawodnik",
  type: "document",
  groups: [
    { name: "main", title: "Podstawowe", default: true },
    { name: "facts", title: "Dane zawodnika" },
    { name: "links", title: "Linki" },
  ],
  fields: [
    defineField({ name: "name", title: "Imię i nazwisko", type: "string", group: "main", description: "Z polskimi znakami. Tak wyświetla się na stronie.", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Adres strony", type: "slug", group: "main", options: { source: "name", maxLength: 80 }, description: "zkortu.pl/zawodnicy/…  Nie zmieniaj po publikacji, bo zepsujesz linki.", validation: (r) => r.required() }),
    defineField({ name: "tour", title: "Tour", type: "string", group: "main", options: { list: [{ title: "ATP (mężczyźni)", value: "ATP" }, { title: "WTA (kobiety)", value: "WTA" }], layout: "radio" }, validation: (r) => r.required() }),
    defineField({ name: "countryCode", title: "Kraj (kod ISO, np. PL)", type: "string", group: "main", description: "Puste dla zawodników startujących jako neutralni.", validation: (r) => r.custom((v) => !v || /^[A-Z]{2}$/.test(v) || "Dwie wielkie litery, np. PL") }),
    defineField({ name: "apiPlayerKey", title: "Klucz zawodnika w API-Tennis", type: "string", group: "main", description: "Ranking, statystyki i mecze pobierają się po tym kluczu. Nie zmieniaj.", validation: (r) => r.required().regex(/^\d+$/, { name: "liczba" }) }),
    defineField({ name: "tag", title: "Tag artykułów", type: "string", group: "main", description: "Dokładna nazwa tagu w artykułach, zwykle imię i nazwisko z polskimi znakami. Artykuły z tym tagiem pokazują się w profilu." }),
    defineField({
      name: "photo",
      title: "Zdjęcie",
      type: "image",
      group: "main",
      options: { hotspot: true },
      description: "Najlepiej pionowe lub kwadratowe, twarz w centrum. Bez zdjęcia wyświetlają się inicjały.",
      fields: [defineField({ name: "credit", title: "Autor / źródło", type: "string" })],
    }),
    defineField({ name: "bio", title: "Krótki opis", type: "text", rows: 5, group: "main" }),

    defineField({ name: "height", title: "Wzrost (cm)", type: "number", group: "facts", validation: (r) => r.min(140).max(230) }),
    defineField({ name: "plays", title: "Ręka", type: "string", group: "facts", options: { list: [{ title: "Praworęczny/a", value: "right" }, { title: "Leworęczny/a", value: "left" }], layout: "radio" } }),
    defineField({ name: "backhand", title: "Bekhend", type: "string", group: "facts", options: { list: [{ title: "Oburęczny", value: "two" }, { title: "Jednoręczny", value: "one" }], layout: "radio" } }),
    defineField({ name: "birthplace", title: "Miejsce urodzenia", type: "string", group: "facts" }),
    defineField({ name: "coach", title: "Trener", type: "string", group: "facts" }),
    defineField({ name: "careerHigh", title: "Najwyższy ranking w karierze", type: "number", group: "facts", validation: (r) => r.min(1).integer() }),
    defineField({ name: "careerHighDate", title: "Data najwyższego rankingu", type: "date", group: "facts" }),

    defineField({ name: "website", title: "Strona www", type: "url", group: "links" }),
    defineField({ name: "instagram", title: "Instagram", type: "url", group: "links" }),
    defineField({ name: "x", title: "X / Twitter", type: "url", group: "links" }),
    defineField({ name: "facebook", title: "Facebook", type: "url", group: "links" }),
  ],
  orderings: [{ title: "Imię i nazwisko", name: "nameAsc", by: [{ field: "name", direction: "asc" }] }],
  preview: {
    select: { title: "name", tour: "tour", country: "countryCode", media: "photo" },
    prepare: ({ title, tour, country, media }) => ({ title, subtitle: [tour, country].filter(Boolean).join(" · "), media }),
  },
});
