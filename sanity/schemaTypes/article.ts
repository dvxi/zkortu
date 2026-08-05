import { defineField, defineType } from "sanity";

const CATEGORIES = ["ATP", "WTA", "Roland Garros", "Wimbledon", "Transfer", "Polska", "Juniorzy"];

export const articleType = defineType({
  name: "article",
  title: "Artykuł",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tytuł", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug (URL)", type: "slug", options: { source: "title", maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: "excerpt", title: "Skrót", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({
      name: "category",
      title: "Kategoria",
      type: "string",
      options: { list: CATEGORIES.map((c) => ({ title: c, value: c })) },
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", title: "Data publikacji", type: "date", validation: (r) => r.required() }),
    defineField({ name: "readTime", title: "Czas czytania (min)", type: "number", validation: (r) => r.required().min(1) }),
    defineField({ name: "imageQuery", title: "Słowa kluczowe obrazu", type: "string" }),
    defineField({ name: "featured", title: "Wyróżniony", type: "boolean", initialValue: false }),
    defineField({ name: "author", title: "Autor", type: "string", validation: (r) => r.required() }),
    defineField({ name: "authorRole", title: "Rola autora", type: "string" }),
    defineField({
      name: "content",
      title: "Treść",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normalny", value: "normal" },
            { title: "Lead (wyróżniony)", value: "lead" },
            { title: "Nagłówek H2", value: "h2" },
            { title: "Nagłówek H3", value: "h3" },
            { title: "Cytat", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Pogrubiony", value: "strong" },
              { title: "Kursywa", value: "em" },
              { title: "Podkreślenie", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  { name: "href", type: "url", title: "URL" },
                  { name: "blank", type: "boolean", title: "Otwórz w nowym oknie", initialValue: true },
                ],
              },
            ],
          },
        },
      ],
      validation: (r) => r.required().min(1),
    }),
  ],
  orderings: [{ title: "Data (nowe)", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", subtitle: "date" },
    prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle ?? "" }),
  },
});
