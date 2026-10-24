import { defineArrayMember, defineField, defineType } from "sanity";
import { ARTICLE_CATEGORIES } from "../../lib/constants";

const imageFields = [
  defineField({ name: "alt", title: "Tekst alternatywny (dostępność)", type: "string" }),
  defineField({ name: "caption", title: "Podpis zdjęcia", type: "string", description: "np. Iga Świątek po finale Roland Garros 2026" }),
  defineField({ name: "credit", title: "Źródło / autor zdjęcia", type: "string", description: "np. fot. Jan Kowalski / PAP" }),
];

export const articleType = defineType({
  name: "article",
  title: "Artykuł",
  type: "document",
  groups: [
    { name: "content", title: "Treść", default: true },
    { name: "meta", title: "Autor i źródło" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Tytuł", type: "string", group: "content", validation: (r) => r.required().max(140) }),
    defineField({
      name: "slug",
      title: "Adres URL (slug)",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Lead / skrót",
      type: "text",
      rows: 3,
      group: "content",
      description: "Krótkie wprowadzenie widoczne na listach i pod tytułem artykułu.",
      validation: (r) => r.required().max(400),
    }),
    defineField({
      name: "category",
      title: "Kategoria",
      type: "string",
      group: "content",
      options: { list: ARTICLE_CATEGORIES.map((c) => ({ title: c, value: c })) },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tags",
      title: "Tagi",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: 'Klikalne tagi, np. "Iga Świątek", "WTA", "Roland Garros".',
    }),
    defineField({
      name: "mainImage",
      title: "Zdjęcie główne",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: imageFields,
      description: "Format 16:9 (np. 1920×1080). Podpis i źródło wyświetlają się na zdjęciu.",
    }),
    defineField({
      name: "content",
      title: "Treść",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Akapit", value: "normal" },
            { title: "Lead (wyróżniony)", value: "lead" },
            { title: "Nagłówek H2", value: "h2" },
            { title: "Nagłówek H3", value: "h3" },
            { title: "Cytat", value: "blockquote" },
          ],
          lists: [
            { title: "Lista punktowana", value: "bullet" },
            { title: "Lista numerowana", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Pogrubienie", value: "strong" },
              { title: "Kursywa", value: "em" },
              { title: "Podkreślenie", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  { name: "href", type: "url", title: "URL", validation: (r) => r.uri({ scheme: ["http", "https", "mailto"] }) },
                  { name: "blank", type: "boolean", title: "Otwórz w nowej karcie", initialValue: true },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          title: "Zdjęcie w treści",
          options: { hotspot: true },
          fields: imageFields,
        }),
        defineArrayMember({
          type: "object",
          name: "embed",
          title: "Osadzony wpis (X, Instagram, YouTube)",
          fields: [
            defineField({
              name: "html",
              title: "Kod osadzenia (HTML)",
              type: "text",
              rows: 6,
              description: "Wklej kod z opcji „Osadź” na X/Twitterze, Instagramie lub YouTube.",
              validation: (r) => r.required(),
            }),
            defineField({ name: "caption", title: "Podpis (opcjonalnie)", type: "string" }),
          ],
          preview: {
            select: { html: "html", caption: "caption" },
            prepare: ({ html, caption }) => ({
              title: caption || "Osadzony wpis",
              subtitle: html?.includes("twitter-tweet") ? "X / Twitter" : html?.includes("instagram") ? "Instagram" : html?.includes("youtube") ? "YouTube" : "HTML",
            }),
          },
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: "featured", title: "Wyróżniony na stronie głównej", type: "boolean", group: "content", initialValue: false }),

    defineField({ name: "author", title: "Autor", type: "string", group: "meta", validation: (r) => r.required() }),
    defineField({ name: "authorRole", title: "Rola autora", type: "string", group: "meta", description: "np. Redaktor naczelny" }),
    defineField({ name: "articleSource", title: "Źródło artykułu", type: "string", group: "meta", description: "np. PAP, ATP Tour, własne" }),
    defineField({ name: "date", title: "Data publikacji", type: "date", group: "meta", validation: (r) => r.required() }),
    defineField({ name: "updatedAt", title: "Data aktualizacji", type: "date", group: "meta", description: "Uzupełnij, gdy artykuł został zaktualizowany po publikacji." }),
    defineField({
      name: "readTime",
      title: "Czas czytania (min)",
      type: "number",
      group: "meta",
      description: "Zostaw puste, aby policzyć automatycznie.",
      validation: (r) => r.min(1).max(60),
    }),

    defineField({
      name: "seoDescription",
      title: "Opis SEO (meta description)",
      type: "text",
      rows: 2,
      group: "seo",
      description: "Opcjonalnie. Domyślnie używany jest lead.",
      validation: (r) => r.max(160),
    }),
  ],
  orderings: [{ title: "Data (najnowsze)", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", subtitle: "date", media: "mainImage", category: "category" },
    prepare: ({ title, subtitle, media, category }) => ({
      title,
      subtitle: [category, subtitle].filter(Boolean).join(" · "),
      media,
    }),
  },
});
