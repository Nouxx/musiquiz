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
      ...S.documentTypeListItems().filter(
        (listItem) => !["homepage"].includes(listItem.getId() ?? ""),
      ),
    ]);
