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
      of: [{ type: "contentBlock" }],
      validation: (r) => r.required().min(1),
    }),
  ],
  orderings: [{ title: "Data (nowe)", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", subtitle: "date" },
    prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle ?? "" }),
  },
});
