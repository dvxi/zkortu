import { defineField, defineType } from "sanity";

export const contentBlockType = defineType({
  name: "contentBlock",
  title: "Blok treści",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Typ",
      type: "string",
      options: {
        list: [
          { title: "Lead", value: "lead" },
          { title: "Akapit", value: "paragraph" },
          { title: "Nagłówek", value: "heading" },
          { title: "Cytat", value: "quote" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "text",
      title: "Tekst",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "quoteAuthor",
      title: "Autor cytatu",
      type: "string",
      hidden: ({ parent }) => parent?.type !== "quote",
    }),
  ],
  preview: {
    select: { type: "type", text: "text" },
    prepare: ({ type, text }) => ({
      title: `[${type}] ${text?.slice(0, 60) ?? ""}`,
    }),
  },
});
