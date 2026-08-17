import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/schemas";
import { myStructure } from "./structure";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
import { dataset, projectId } from "./src/environments";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export const singletonIds = ["homepage", "siteSettings"];

const singletonTypes = new Set(singletonIds);

/** types that are never created from the "create new" menu */
const structureOnlyTypes = new Set(["venuePage", "venueGame"]);

export const venuePageTemplateId = "venuePage-by-venue";
export const venueGameTemplateId = "venueGame-by-venue";

export default defineConfig({
  name: "default",
  title: "MusiQuiz",
  projectId: projectId,
  dataset: dataset,
  plugins: [
    structureTool({ structure: myStructure }),
    visionTool(),
    internationalizedArray({
      languages: [
        { id: "en", title: "English" },
        { id: "fr", title: "French" },
      ],
      defaultLanguages: ["fr"],
      fieldTypes: ["string"],
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => [
      // restrict creation for the singleton and structure-only types
      ...templates.filter(
        ({ schemaType }) =>
          !singletonTypes.has(schemaType) &&
          !structureOnlyTypes.has(schemaType),
      ),
      // make sure venue and page type fields are filled before the editor sees the document
      {
        id: venuePageTemplateId,
        title: "Venue Page",
        schemaType: "venuePage",
        parameters: [
          { name: "venueId", type: "string" },
          { name: "pageType", type: "string" },
        ],
        value: ({
          venueId,
          pageType,
        }: {
          venueId: string;
          pageType: string;
        }) => ({
          pageType,
          venue: { _type: "reference", _ref: venueId },
        }),
      },
      {
        id: venueGameTemplateId,
        title: "Venue Game",
        schemaType: "venueGame",
        parameters: [{ name: "venueId", type: "string" }],
        value: ({ venueId }: { venueId: string }) => ({
          venue: { _type: "reference", _ref: venueId },
        }),
      },
    ],
  },
  document: {
    // restrict edition actions for singleton types
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
});
