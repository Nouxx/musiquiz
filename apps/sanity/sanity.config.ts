import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/schemas";
import { myStructure } from "./structure";
import { internationalizedArray } from "sanity-plugin-internationalized-array";
import { dataset, projectId } from "./src/environments";
import { richTextFieldType } from "./src/schemas/shared/richText";
import { languages } from "./src/schemas/shared/localized";
import { deploySiteTool } from "./src/tools/deploySite";
import { siteUrlsTool } from "./src/tools/siteUrls";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export const singletonIds = [
  "homepage",
  "joinTheNetworkPage",
  "contactPage",
  "whereToFindUsPage",
  "globalBookingPage",
  "legalNoticePage",
  "termsAndConditionsPage",
  "blogPage",
  "siteSettings",
];

const singletonTypes = new Set(singletonIds);

/** types that are never created from the "create new" menu */
const structureOnlyTypes = new Set([
  "venuePage",
  "venueGame",
  "venueEvent",
  "venueCustomPage",
  "venueBlog",
  "venuePopup",
  "globalGame",
  "globalEvent",
]);

export const venuePageTemplateId = "venuePage-by-venue";
export const venueGameTemplateId = "venueGame-by-venue";
export const venueEventTemplateId = "venueEvent-by-venue";
export const venueCustomPageTemplateId = "venueCustomPage-by-venue";
export const venueBlogTemplateId = "venueBlog-by-venue";
export const venuePopupTemplateId = "venuePopup-by-venue";
export const globalGameTemplateId = "globalGame-by-game";
export const globalEventTemplateId = "globalEvent-by-event";

// when a doc is draft, others document that relies on it can have issues
// because they expect it to be published
// this fixes it
function venueReference(venueId: string) {
  return {
    _type: "reference",
    _ref: venueId,
    _weak: true,
    _strengthenOnPublish: { type: "venue" },
  };
}

function formatReference(formatId: string, type: "gameFormat" | "eventFormat") {
  return {
    _type: "reference",
    _ref: formatId,
    _weak: true,
    _strengthenOnPublish: { type },
  };
}

export default defineConfig({
  name: "default",
  title: "MusiQuiz",
  projectId: projectId,
  dataset: dataset,
  // the default "dual" may sign in with a cookie
  // and users must have a token for the Deploy tool
  // https://reference.sanity.io/sanity/index/AuthConfig/#loginmethod
  auth: { loginMethod: "token" },
  releases: { enabled: false },
  scheduledDrafts: { enabled: false },
  plugins: [
    structureTool({ structure: myStructure }),
    internationalizedArray({
      languages,
      defaultLanguages: ["fr", "en"],
      fieldTypes: ["string", "text", richTextFieldType],
    }),
  ],
  tools: (tools) => [...tools, siteUrlsTool, deploySiteTool],
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
          venue: venueReference(venueId),
        }),
      },
      {
        id: venueGameTemplateId,
        title: "Venue Game",
        schemaType: "venueGame",
        parameters: [{ name: "venueId", type: "string" }],
        value: ({ venueId }: { venueId: string }) => ({
          venue: venueReference(venueId),
        }),
      },
      {
        id: venueBlogTemplateId,
        title: "Venue Blog",
        schemaType: "venueBlog",
        parameters: [{ name: "venueId", type: "string" }],
        value: ({ venueId }: { venueId: string }) => ({
          venue: venueReference(venueId),
        }),
      },
      {
        id: venuePopupTemplateId,
        title: "Venue Pop-up",
        schemaType: "venuePopup",
        parameters: [{ name: "venueId", type: "string" }],
        value: ({ venueId }: { venueId: string }) => ({
          venue: venueReference(venueId),
        }),
      },
      {
        id: venueEventTemplateId,
        title: "Venue Event",
        schemaType: "venueEvent",
        parameters: [{ name: "venueId", type: "string" }],
        value: ({ venueId }: { venueId: string }) => ({
          venue: venueReference(venueId),
        }),
      },
      {
        id: venueCustomPageTemplateId,
        title: "Venue Custom Page",
        schemaType: "venueCustomPage",
        parameters: [{ name: "venueId", type: "string" }],
        value: ({ venueId }: { venueId: string }) => ({
          venue: venueReference(venueId),
        }),
      },
      {
        id: globalGameTemplateId,
        title: "Global Game",
        schemaType: "globalGame",
        parameters: [{ name: "gameId", type: "string" }],
        value: ({ gameId }: { gameId: string }) => ({
          game: formatReference(gameId, "gameFormat"),
        }),
      },
      {
        id: globalEventTemplateId,
        title: "Global Event",
        schemaType: "globalEvent",
        parameters: [{ name: "eventId", type: "string" }],
        value: ({ eventId }: { eventId: string }) => ({
          event: formatReference(eventId, "eventFormat"),
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
