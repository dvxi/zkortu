import { defineArrayMember, defineField, defineType } from "sanity";

export const pageType = defineType({
  name: "page",
  title: "Strona informacyjna",
  type: "document",
  description: "Regulamin, polityka prywatności, o nas, reklama itp.",
  fields: [
    defineField({ name: "title", title: "Tytuł", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Adres URL (slug)",
      type: "slug",
      options: { source: "title", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Treść",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Akapit", value: "normal" },
            { title: "Nagłówek H2", value: "h2" },
            { title: "Nagłówek H3", value: "h3" },
          ],
          lists: [
            { title: "Lista punktowana", value: "bullet" },
            { title: "Lista numerowana", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Pogrubienie", value: "strong" },
              { title: "Kursywa", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL", validation: (r) => r.uri({ scheme: ["http", "https", "mailto"] }) }],
              },
            ],
          },
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({ name: "showInFooter", title: "Pokaż link w stopce", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Kolejność w stopce", type: "number", initialValue: 10 }),
  ],
  orderings: [{ title: "Kolejność", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});
