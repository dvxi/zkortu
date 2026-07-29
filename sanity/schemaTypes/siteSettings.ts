import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Ustawienia serwisu",
  type: "document",
  fields: [
    // ── Dane kontaktowe ───────────────────────────────────────────────────────
    defineField({
      name: "email",
      title: "E-mail kontaktowy",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "phone",
      title: "Telefon",
      type: "string",
    }),
    defineField({
      name: "address",
      title: "Adres (wieloliniowy)",
      type: "text",
      rows: 2,
    }),
    // ── Social media ──────────────────────────────────────────────────────────
    defineField({
      name: "twitter",
      title: "Link Twitter/X",
      type: "url",
    }),
    defineField({
      name: "facebook",
      title: "Link Facebook",
      type: "url",
    }),
    defineField({
      name: "instagram",
      title: "Link Instagram",
      type: "url",
    }),
    // ── Godziny pracy ─────────────────────────────────────────────────────────
    defineField({
      name: "officeHours",
      title: "Godziny pracy redakcji",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "day", title: "Dzień / zakres dni", type: "string" }),
            defineField({ name: "hours", title: "Godziny (np. 9:00 – 18:00 lub Zamknięte)", type: "string" }),
            defineField({ name: "isOpen", title: "Otwarte?", type: "boolean", initialValue: true }),
          ],
          preview: {
            select: { day: "day", hours: "hours" },
            prepare: ({ day, hours }) => ({ title: day, subtitle: hours }),
          },
        }),
      ],
    }),
    // ── Czas odpowiedzi ───────────────────────────────────────────────────────
    defineField({
      name: "responseTime",
      title: "Czas odpowiedzi (np. 1–2 dni)",
      type: "string",
    }),
    // ── Stopka ────────────────────────────────────────────────────────────────
    defineField({
      name: "footerDescription",
      title: "Opis serwisu w stopce",
      type: "text",
      rows: 3,
    }),
    // ── FAQ ───────────────────────────────────────────────────────────────────
    defineField({
      name: "faqs",
      title: "FAQ — Często zadawane pytania",
      description: "Pytania i odpowiedzi widoczne na stronie /kontakt.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "question", title: "Pytanie", type: "string", validation: (r) => r.required() }),
            defineField({ name: "answer", title: "Odpowiedź", type: "text", rows: 3 }),
          ],
          preview: {
            select: { q: "question" },
            prepare: ({ q }) => ({ title: q }),
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Ustawienia serwisu" }),
  },
});
