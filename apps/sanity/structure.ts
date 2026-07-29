import {
  type StructureBuilder,
  type StructureResolver,
} from "sanity/structure";

export const myStructure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Homepage")
        .id("homepage")
        .child(S.document().schemaType("homepage").documentId("homepage")),
      S.listItem()
        .title("Header")
        .id("header")
        .child(S.document().schemaType("header").documentId("header")),
      ...S.documentTypeListItems().filter(
        (listItem) => !["homepage", "header"].includes(listItem.getId() ?? ""),
      ),
    ]);
