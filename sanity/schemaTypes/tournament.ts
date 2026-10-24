import { defineField, defineType } from "sanity";

const SURFACES = ["Hard", "Clay", "Grass", "Indoor Hard"];
const CATEGORIES = ["Grand Slam", "ATP 1000", "ATP 500", "ATP 250", "WTA 1000", "WTA 500", "WTA 250"];

export const tournamentType = defineType({
  name: "tournament",
  title: "Turniej",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nazwa", type: "string", validation: (r) => r.required() }),
    defineField({ name: "location", title: "Miasto", type: "string", validation: (r) => r.required() }),
    defineField({ name: "country", title: "Kraj (PL)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "flag", title: "Flaga (emoji)", type: "string" }),
    defineField({
      name: "surface",
      title: "Nawierzchnia",
      type: "string",
      options: { list: SURFACES.map((s) => ({ title: s, value: s })), layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Kategoria",
      type: "string",
      options: { list: CATEGORIES.map((c) => ({ title: c, value: c })) },
      validation: (r) => r.required(),
    }),
    defineField({ name: "startDate", title: "Data rozpoczęcia", type: "date", validation: (r) => r.required() }),
    defineField({ name: "endDate", title: "Data zakończenia", type: "date", validation: (r) => r.required() }),
    defineField({ name: "prize", title: "Pula nagród", type: "string" }),
    defineField({ name: "currentChampion", title: "Aktualny mistrz", type: "string" }),
    defineField({
      name: "pastWinners",
      title: "Poprzedni zwycięzcy",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "year", title: "Rok", type: "number" }),
            defineField({ name: "name", title: "Zawodnik", type: "string" }),
          ],
          preview: { select: { title: "name", subtitle: "year" } },
        },
      ],
    }),
    defineField({ name: "imageQuery", title: "Słowa kluczowe obrazu", type: "string" }),
    defineField({ name: "liveStreamUrl", title: "Link do transmisji", type: "url" }),
  ],
  orderings: [{ title: "Data (rosnąco)", name: "startDateAsc", by: [{ field: "startDate", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "startDate", category: "category" },
    prepare: ({ title, subtitle, category }) => ({ title: `${title}`, subtitle: `${category} · ${subtitle ?? ""}` }),
  },
});
