import {
  type StructureBuilder,
  type StructureResolver,
} from "sanity/structure";
import { ControlsIcon } from "@sanity/icons/Controls";
import { DocumentIcon } from "@sanity/icons/Document";
import { HomeIcon } from "@sanity/icons/Home";
import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { JoystickIcon } from "@sanity/icons/Joystick";
import { ConfettiIcon } from "@sanity/icons/Confetti";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { RocketIcon } from "@sanity/icons/Rocket";
import { PinIcon } from "@sanity/icons/Pin";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { BookIcon } from "@sanity/icons/Book";
import type { ComponentType } from "react";
import {
  globalPageTemplateId,
  singletonIds,
  venueEventTemplateId,
  venueGameTemplateId,
  venuePageTemplateId,
} from "./sanity.config";

// venuePage, venueGame and venueEvent belong to a venue, only reachable from there
// globalPage has one document per page type, listed by name
const nestedTypeIds = [
  "venue",
  "venuePage",
  "venueGame",
  "venueEvent",
  "globalPage",
];

function venuePageId({
  venueId,
  pageType,
}: {
  venueId: string;
  pageType: string;
}) {
  // the separator is a hyphen and must NEVER be a dot
  // it fucks with Sanity path segments (ex: drafts.foo <- it's a dot)
  return `venuePage-${venueId.replace(/^drafts\./, "")}-${pageType}`;
}

function venuePageItem({
  S,
  venueId,
  pageType,
  title,
}: {
  S: StructureBuilder;
  venueId: string;
  pageType: string;
  title: string;
}) {
  const publishedVenueId = venueId.replace(/^drafts\./, "");

  return S.listItem()
    .title(title)
    .id(pageType)
    .child(
      S.document()
        .schemaType("venuePage")
        .documentId(venuePageId({ venueId, pageType }))
        .title(title)
        .initialValueTemplate(venuePageTemplateId, {
          venueId: publishedVenueId,
          pageType,
        }),
    );
}

function globalPageItem({
  S,
  pageType,
  title,
  icon = DocumentIcon,
}: {
  S: StructureBuilder;
  pageType: string;
  title: string;
  icon?: ComponentType;
}) {
  return S.listItem()
    .title(title)
    .id(`globalPage-${pageType}`)
    .icon(icon)
    .child(
      S.document()
        .schemaType("globalPage")
        .documentId(`globalPage-${pageType}`)
        .title(title)
        .initialValueTemplate(globalPageTemplateId, { pageType }),
    );
}

function venueChild({ S, venueId }: { S: StructureBuilder; venueId: string }) {
  return S.list()
    .title("Venue")
    .items([
      venuePageItem({ S, venueId, pageType: "home", title: "Home page" }),
      venuePageItem({ S, venueId, pageType: "gift", title: "Gift page" }),
      venuePageItem({ S, venueId, pageType: "book", title: "Booking page" }),

      S.listItem()
        .title("Games")
        .id("games")
        .icon(JoystickIcon)
        .child(
          S.documentList()
            .title("Games")
            .schemaType("venueGame")
            .filter('_type == "venueGame" && venue._ref == $venueId')
            .params({ venueId: venueId.replace(/^drafts\./, "") })
            .initialValueTemplates([
              S.initialValueTemplateItem(venueGameTemplateId, {
                venueId: venueId.replace(/^drafts\./, ""),
              }),
            ]),
        ),

      S.listItem()
        .title("Events")
        .id("events")
        .icon(ConfettiIcon)
        .child(
          S.documentList()
            .title("Events")
            .schemaType("venueEvent")
            .filter('_type == "venueEvent" && venue._ref == $venueId')
            .params({ venueId: venueId.replace(/^drafts\./, "") })
            .initialValueTemplates([
              S.initialValueTemplateItem(venueEventTemplateId, {
                venueId: venueId.replace(/^drafts\./, ""),
              }),
            ]),
        ),

      S.listItem()
        .title("Venue details")
        .id("details")
        .icon(InfoOutlineIcon)
        .child(S.document().schemaType("venue").documentId(venueId)),
    ]);
}

export const myStructure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Homepage")
        .id("homepage")
        .child(S.document().schemaType("homepage").documentId("homepage")),

      globalPageItem({
        S,
        pageType: "joinTheNetwork",
        title: "Join the network page",
        icon: RocketIcon,
      }),

      globalPageItem({
        S,
        pageType: "contact",
        title: "Contact page",
        icon: EnvelopeIcon,
      }),

      globalPageItem({
        S,
        pageType: "whereToFindUs",
        title: "Where to find us page",
        icon: PinIcon,
      }),

      globalPageItem({
        S,
        pageType: "legalNotice",
        title: "Legal notice page",
        icon: DocumentTextIcon,
      }),

      globalPageItem({
        S,
        pageType: "termsAndConditions",
        title: "Terms and conditions page",
        icon: BookIcon,
      }),

      S.listItem()
        .title("Venues")
        .id("venues")
        .icon(HomeIcon)
        .child(
          S.documentTypeList("venue")
            .title("Venues")
            .child((venueId) => venueChild({ S, venueId })),
        ),

      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId() ?? "";
        return !singletonIds.includes(id) && !nestedTypeIds.includes(id);
      }),

      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .icon(ControlsIcon)
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
    ]);
