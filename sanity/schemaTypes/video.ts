import { defineField, defineType } from "sanity";

export const videoType = defineType({
  name: "video",
  title: "Wideo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "youtubeUrl",
      title: "Link YouTube",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Opis",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "players",
      title: "Zawodnicy",
      type: "string",
      description: 'np. "I. Świątek vs A. Sabalenka"',
    }),
    defineField({
      name: "tournament",
      title: "Turniej",
      type: "string",
    }),
    defineField({
      name: "date",
      title: "Data",
      type: "date",
    }),
    defineField({
      name: "duration",
      title: "Czas trwania",
      type: "string",
      description: 'np. "8:24"',
    }),
    defineField({
      name: "category",
      title: "Kategoria",
      type: "string",
      options: {
        list: [
          { title: "Highlights", value: "Highlights" },
          { title: "Full Match", value: "Full Match" },
          { title: "Interview", value: "Interview" },
          { title: "Analysis", value: "Analysis" },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "players",
    },
  },
});
