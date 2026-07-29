import { defineField, defineType } from "sanity";

const COUNTRIES = [
  { title: "Albania 🇦🇱", value: "AL" }, { title: "Argentyna 🇦🇷", value: "AR" },
  { title: "Australia 🇦🇺", value: "AU" }, { title: "Austria 🇦🇹", value: "AT" },
  { title: "Belgia 🇧🇪", value: "BE" }, { title: "Białoruś 🇧🇾", value: "BY" },
  { title: "Brazylia 🇧🇷", value: "BR" }, { title: "Bułgaria 🇧🇬", value: "BG" },
  { title: "Chile 🇨🇱", value: "CL" }, { title: "Chiny 🇨🇳", value: "CN" },
  { title: "Chorwacja 🇭🇷", value: "HR" }, { title: "Czechy 🇨🇿", value: "CZ" },
  { title: "Dania 🇩🇰", value: "DK" }, { title: "Finlandia 🇫🇮", value: "FI" },
  { title: "Francja 🇫🇷", value: "FR" }, { title: "Grecja 🇬🇷", value: "GR" },
  { title: "Hiszpania 🇪🇸", value: "ES" }, { title: "Holandia 🇳🇱", value: "NL" },
  { title: "Hong Kong 🇭🇰", value: "HK" }, { title: "Indie 🇮🇳", value: "IN" },
  { title: "Japonia 🇯🇵", value: "JP" }, { title: "Kanada 🇨🇦", value: "CA" },
  { title: "Kazachstan 🇰🇿", value: "KZ" }, { title: "Korea Południowa 🇰🇷", value: "KR" },
  { title: "Meksyk 🇲🇽", value: "MX" }, { title: "Niemcy 🇩🇪", value: "DE" },
  { title: "Norwegia 🇳🇴", value: "NO" }, { title: "Polska 🇵🇱", value: "PL" },
  { title: "Portugalia 🇵🇹", value: "PT" }, { title: "Rosja 🇷🇺", value: "RU" },
  { title: "Rumunia 🇷🇴", value: "RO" }, { title: "Serbia 🇷🇸", value: "RS" },
  { title: "Słowacja 🇸🇰", value: "SK" }, { title: "Szwajcaria 🇨🇭", value: "CH" },
  { title: "Szwecja 🇸🇪", value: "SE" }, { title: "Tajwan 🇹🇼", value: "TW" },
  { title: "Ukraina 🇺🇦", value: "UA" }, { title: "USA 🇺🇸", value: "US" },
  { title: "Węgry 🇭🇺", value: "HU" }, { title: "Wielka Brytania 🇬🇧", value: "GB" },
  { title: "Włochy 🇮🇹", value: "IT" },
];

export const juniorPlayerType = defineType({
  name: "juniorPlayer",
  title: "Zawodnik juniorski",
  type: "document",
  fields: [
    defineField({
      name: "tour",
      title: "Kategoria",
      type: "string",
      options: {
        list: [
          { title: "Chłopcy (Boys)", value: "Boys" },
          { title: "Dziewczynki (Girls)", value: "Girls" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "rank",
      title: "Miejsce w rankingu",
      type: "number",
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "name",
      title: "Imię i nazwisko",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "countryCode",
      title: "Kraj",
      type: "string",
      options: { list: COUNTRIES },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "points",
      title: "Punkty ITF",
      type: "number",
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: "pointsDiff",
      title: "Zmiana pkt od ostatniego tygodnia",
      description: "Wpisz wartość dodatnią (wzrost) lub ujemną (spadek), np. +40 lub -15. Zero = bez zmian.",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "rankingDate",
      title: "Data rankingu ITF",
      description: "ITF aktualizuje rankingi w każdy poniedziałek.",
      type: "date",
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    { title: "Ranking rosnąco", name: "rankAsc", by: [{ field: "rank", direction: "asc" }] },
  ],
  preview: {
    select: { name: "name", rank: "rank", tour: "tour", country: "countryCode" },
    prepare: ({ name, rank, tour, country }) => ({
      title: `#${rank} ${name}`,
      subtitle: `${tour} · ${country ?? ""}`,
    }),
  },
});
