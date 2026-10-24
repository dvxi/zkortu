import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Ustawienia serwisu",
  type: "document",
  groups: [
    { name: "contact", title: "Kontakt", default: true },
    { name: "brand", title: "Marka i stopka" },
    { name: "features", title: "Funkcje" },
  ],
  fields: [
    // ── Dane kontaktowe ───────────────────────────────────────────────────────
    defineField({ name: "email", title: "E-mail kontaktowy", type: "string", group: "contact", validation: (r) => r.required() }),
    defineField({ name: "phone", title: "Telefon", type: "string", group: "contact" }),
    defineField({ name: "address", title: "Adres (wieloliniowy)", type: "text", rows: 2, group: "contact" }),
    defineField({ name: "twitter", title: "Link X / Twitter", type: "url", group: "contact" }),
    defineField({ name: "facebook", title: "Link Facebook", type: "url", group: "contact" }),
    defineField({ name: "instagram", title: "Link Instagram", type: "url", group: "contact" }),
    defineField({ name: "youtube", title: "Link YouTube", type: "url", group: "contact" }),
    defineField({
      name: "officeHours",
      title: "Godziny pracy redakcji",
      type: "array",
      group: "contact",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "day", title: "Dzień / zakres dni", type: "string" }),
            defineField({ name: "hours", title: "Godziny (np. 9:00 – 18:00 lub Zamknięte)", type: "string" }),
            defineField({ name: "isOpen", title: "Otwarte?", type: "boolean", initialValue: true }),
          ],
          preview: { select: { day: "day", hours: "hours" }, prepare: ({ day, hours }) => ({ title: day, subtitle: hours }) },
        }),
      ],
    }),
    defineField({ name: "responseTime", title: "Czas odpowiedzi (np. 1–2 dni)", type: "string", group: "contact" }),
    defineField({
      name: "faqs",
      title: "FAQ – często zadawane pytania",
      type: "array",
      group: "contact",
      description: "Widoczne na stronie /kontakt.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "question", title: "Pytanie", type: "string", validation: (r) => r.required() }),
            defineField({ name: "answer", title: "Odpowiedź", type: "text", rows: 3 }),
          ],
          preview: { select: { q: "question" }, prepare: ({ q }) => ({ title: q }) },
        }),
      ],
    }),

    // ── Marka i stopka ────────────────────────────────────────────────────────
    defineField({
      name: "logo",
      title: "Logo (SVG lub PNG, na pomarańczowym tle)",
      type: "image",
      group: "brand",
      description: "Bez logo wyświetlany jest napis „zkortu.pl”.",
    }),
    defineField({ name: "footerDescription", title: "Opis serwisu w stopce", type: "text", rows: 3, group: "brand" }),
    defineField({
      name: "ogImage",
      title: "Domyślny obraz do udostępniania (1200×630)",
      type: "image",
      group: "brand",
      description: "Używany, gdy artykuł nie ma zdjęcia głównego.",
    }),

    // ── Funkcje ───────────────────────────────────────────────────────────────
    defineField({ name: "commentsEnabled", title: "Komentarze włączone", type: "boolean", group: "features", initialValue: true }),
    defineField({
      name: "commentsAutoApprove",
      title: "Publikuj komentarze bez moderacji",
      type: "boolean",
      group: "features",
      initialValue: false,
      description: "Wyłączone: komentarze czekają na zatwierdzenie w zakładce Komentarze → Do moderacji.",
    }),
  ],
  preview: { prepare: () => ({ title: "Ustawienia serwisu" }) },
});
