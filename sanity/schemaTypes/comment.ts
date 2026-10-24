import { defineField, defineType } from "sanity";

export const commentType = defineType({
  name: "comment",
  title: "Komentarz",
  type: "document",
  fields: [
    defineField({
      name: "article",
      title: "Artykuł",
      type: "reference",
      to: [{ type: "article" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "authorName", title: "Podpis", type: "string", validation: (r) => r.required().max(60) }),
    defineField({ name: "body", title: "Treść", type: "text", rows: 4, validation: (r) => r.required().max(1200) }),
    defineField({ name: "createdAt", title: "Data dodania", type: "datetime", validation: (r) => r.required() }),
    defineField({
      name: "approved",
      title: "Zatwierdzony (widoczny na stronie)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "ipHash", title: "Skrót IP (do moderacji)", type: "string", readOnly: true }),
    defineField({ name: "userAgent", title: "Przeglądarka", type: "string", readOnly: true, hidden: true }),
  ],
  orderings: [{ title: "Najnowsze", name: "createdAtDesc", by: [{ field: "createdAt", direction: "desc" }] }],
  preview: {
    select: { authorName: "authorName", body: "body", approved: "approved", article: "article.title", createdAt: "createdAt" },
    prepare: ({ authorName, body, approved, article, createdAt }) => ({
      title: `${approved ? "✅" : "⏳"} ${authorName ?? ""}: ${(body ?? "").slice(0, 60)}`,
      subtitle: [article, createdAt ? new Date(createdAt).toLocaleString("pl-PL") : ""].filter(Boolean).join(" · "),
    }),
  },
});
