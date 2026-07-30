import {
  type StructureBuilder,
  type StructureResolver,
} from "sanity/structure";
import { ControlsIcon } from "@sanity/icons/Controls";
import { singletonIds } from "./sanity.config";

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
        (listItem) => !singletonIds.includes(listItem.getId() ?? ""),
      ),

      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .icon(ControlsIcon)
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
    ]);
