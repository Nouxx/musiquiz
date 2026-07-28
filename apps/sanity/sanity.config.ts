import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/schemas";
import { myStructure } from "./structure";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
import { dataset, projectId } from "./src/environments";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);

const singletonTypes = new Set(["homepage"]);

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
    // restrict creation for the singleton types
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    // restrict edition actions for singleton types
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
});
