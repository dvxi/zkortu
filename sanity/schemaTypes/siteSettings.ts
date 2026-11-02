import { ARTICLE_CATEGORIES } from "../../lib/constants";
import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Ustawienia serwisu",
  type: "document",
  groups: [
    { name: "home", title: "Strona główna" },
    { name: "contact", title: "Kontakt", default: true },
    { name: "brand", title: "Marka i stopka" },
    { name: "features", title: "Funkcje" },
  ],
  fields: [
    defineField({ name: "featuredArticle", title: "Główny artykuł", type: "reference", to: [{ type: "article" }], group: "home", description: "Wybierz opublikowany artykuł. Wybór ma pierwszeństwo przed polem Wyróżniony w artykule." }),
    defineField({ name: "mobileHomeOrder", title: "Kolejność sekcji na telefonie", type: "array", group: "home", description: "Przeciągnij pozycje. Pominięte sekcje pojawią się na końcu.",
      initialValue: ["news", "wta", "editorial", "tournaments", "atp", "video"].map((section) => ({ _type: "homeSection", _key: section, section })),
      of: [defineArrayMember({ type: "object", name: "homeSection", fields: [
        defineField({ name: "section", title: "Sekcja", type: "string", validation: (r) => r.required(), options: { list: [
          { title: "Newsy", value: "news" }, { title: "Ranking WTA", value: "wta" },
          { title: "Więcej z redakcji / sekcje tematyczne", value: "editorial" }, { title: "Turnieje", value: "tournaments" },
          { title: "Ranking ATP", value: "atp" }, { title: "Wideo", value: "video" },
        ] } }),
      ], preview: { select: { section: "section" }, prepare: ({ section }) => ({ title: ({ news: "Newsy", wta: "Ranking WTA", editorial: "Sekcje redakcyjne", tournaments: "Turnieje", atp: "Ranking ATP", video: "Wideo" } as Record<string, string>)[section] || section }) } })],
      validation: (r) => r.unique(),
    }),
    defineField({ name: "editorialSections", title: "Sekcje tematyczne", type: "array", group: "home", description: "Zastępują sekcję Więcej z redakcji. Jeśli podasz tag i kategorię, artykuł musi spełniać oba warunki.", of: [defineArrayMember({ type: "object", fields: [
      defineField({ name: "title", title: "Nagłówek", type: "string", validation: (r) => r.required() }),
      defineField({ name: "tag", title: "Tag (dokładna nazwa)", type: "string" }),
      defineField({ name: "category", title: "Kategoria", type: "string", options: { list: [...ARTICLE_CATEGORIES] } }),
    ], preview: { select: { title: "title", subtitle: "tag" } } })] }),

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
