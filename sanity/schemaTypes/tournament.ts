import { defineArrayMember, defineField, defineType } from "sanity";

const SURFACES = ["Hard", "Clay", "Grass", "Indoor Hard"];
const SURFACE_TITLES: Record<string, string> = { Hard: "Twarda (Hard)", Clay: "Mączka (Clay)", Grass: "Trawa (Grass)", "Indoor Hard": "Hala (Indoor Hard)" };
const CATEGORIES = ["Grand Slam", "ATP Finals", "WTA Finals", "ATP 1000", "ATP 500", "ATP 250", "WTA 1000", "WTA 500", "WTA 250", "Inne"];

export const tournamentType = defineType({
  name: "tournament",
  title: "Turniej",
  type: "document",
  groups: [
    { name: "basic", title: "Podstawowe", default: true },
    { name: "extra", title: "Dodatkowe" },
    { name: "api", title: "Integracja wyników" },
  ],
  fields: [
    defineField({ name: "name", title: "Nazwa", type: "string", group: "basic", validation: (r) => r.required() }),
    defineField({ name: "location", title: "Miasto", type: "string", group: "basic", validation: (r) => r.required() }),
    defineField({ name: "country", title: "Kraj (po polsku)", type: "string", group: "basic", validation: (r) => r.required() }),
    defineField({
      name: "countryCode",
      title: "Kod kraju (ISO, 2 litery)",
      type: "string",
      group: "basic",
      description: "np. PL, FR, US. Z kodu generowana jest flaga.",
      validation: (r) => r.regex(/^[A-Za-z]{2}$/, { name: "kod ISO" }).warning("Podaj 2-literowy kod kraju"),
    }),
    defineField({ name: "flag", title: "Flaga (emoji, opcjonalnie)", type: "string", group: "basic", hidden: ({ document }) => Boolean(document?.countryCode) }),
    defineField({
      name: "surface",
      title: "Nawierzchnia",
      type: "string",
      group: "basic",
      options: { list: SURFACES.map((s) => ({ title: SURFACE_TITLES[s], value: s })), layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Kategoria",
      type: "string",
      group: "basic",
      options: { list: CATEGORIES.map((c) => ({ title: c, value: c })) },
      validation: (r) => r.required(),
    }),
    defineField({ name: "startDate", title: "Data rozpoczęcia", type: "date", group: "basic", validation: (r) => r.required() }),
    defineField({
      name: "endDate",
      title: "Data zakończenia",
      type: "date",
      group: "basic",
      validation: (r) =>
        r.required().custom((end, ctx) => {
          const start = (ctx.document as { startDate?: string } | undefined)?.startDate;
          if (start && end && end < start) return "Data zakończenia musi być po dacie rozpoczęcia";
          return true;
        }),
    }),
    defineField({
      name: "image",
      title: "Zdjęcie turnieju",
      type: "image",
      group: "basic",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Tekst alternatywny", type: "string" }),
        defineField({ name: "credit", title: "Źródło zdjęcia", type: "string" }),
      ],
      description: "Format 2:1 lub 16:9. Bez zdjęcia wyświetlana jest grafika zastępcza w kolorze nawierzchni.",
    }),

    defineField({ name: "prize", title: "Pula nagród", type: "string", group: "extra", description: "np. 2 500 000 €" }),
    defineField({ name: "currentChampion", title: "Obrońca tytułu", type: "string", group: "extra" }),
    defineField({
      name: "pastWinners",
      title: "Poprzedni zwycięzcy",
      type: "array",
      group: "extra",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "year", title: "Rok", type: "number" }),
            defineField({ name: "name", title: "Zawodnik", type: "string" }),
          ],
          preview: { select: { title: "name", subtitle: "year" } },
        }),
      ],
    }),
    defineField({ name: "description", title: "Opis", type: "text", rows: 4, group: "extra" }),
    defineField({ name: "website", title: "Strona turnieju", type: "url", group: "extra" }),
    defineField({ name: "liveStreamUrl", title: "Link do transmisji", type: "url", group: "extra" }),

    defineField({
      name: "apiTournamentKey",
      title: "Klucz turnieju w API-Tennis",
      type: "string",
      group: "api",
      description:
        "Opcjonalnie. Zostaw puste, aby dopasować turniej automatycznie po nazwie i mieście. Kilka kluczy (np. ATP i WTA) rozdziel przecinkiem.",
    }),
  ],
  orderings: [{ title: "Data (rosnąco)", name: "startDateAsc", by: [{ field: "startDate", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "startDate", category: "category", media: "image" },
    prepare: ({ title, subtitle, category, media }) => ({ title, subtitle: `${category} · ${subtitle ?? ""}`, media }),
  },
});
