import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

const SINGLETONS = new Set(["siteSettings"]);

const structure: StructureResolver = (S) =>
  S.list()
    .title("Treść")
    .items([
      S.listItem()
        .title("Ustawienia serwisu")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Ustawienia serwisu")),
      S.divider(),
      S.documentTypeListItem("article").title("Artykuły"),
      S.listItem()
        .title("Komentarze")
        .child(
          S.list()
            .title("Komentarze")
            .items([
              S.listItem()
                .title("Do moderacji")
                .child(
                  S.documentList()
                    .title("Do moderacji")
                    .filter('_type == "comment" && approved != true')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
                ),
              S.listItem()
                .title("Zatwierdzone")
                .child(
                  S.documentList()
                    .title("Zatwierdzone")
                    .filter('_type == "comment" && approved == true')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
                ),
            ]),
        ),
      S.documentTypeListItem("tournament").title("Kalendarz turniejów"),
      S.documentTypeListItem("video").title("Wideo"),
      S.documentTypeListItem("page").title("Strony informacyjne"),
      S.divider(),
      S.documentTypeListItem("juniorPlayer").title("Zawodnicy juniorscy"),
    ]);

export default defineConfig({
  name: "zkortu",
  title: "zkortu.pl — CMS",
  basePath: "/studio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: schemaTypes,
    // singletons cannot be created from the "new document" menu
    templates: (templates) => templates.filter((t) => !SINGLETONS.has(t.schemaType)),
  },
  document: {
    actions: (actions, ctx) =>
      SINGLETONS.has(ctx.schemaType)
        ? actions.filter((a) => !["unpublish", "delete", "duplicate"].includes(a.action ?? ""))
        : actions,
  },
});
