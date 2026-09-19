import {
  defineField,
  defineType,
  type Rule,
  type SanityDocument,
} from "sanity";
import { DocumentIcon } from "@sanity/icons/Document";

export const globalPageTypes = [
  { value: "joinTheNetwork", title: "Join the network page" },
  { value: "contact", title: "Contact page" },
  { value: "whereToFindUs", title: "Where to find us page" },
] as const;

function isContactPage(document: SanityDocument | undefined) {
  return document?.pageType === "contact";
}

function hasMap(document: SanityDocument | undefined) {
  return document?.pageType === "whereToFindUs";
}

// only required on the contact page: `rule.required()` cannot see the page type
function requiredOnContactPage(rule: Rule) {
  return rule.custom<unknown[] | undefined>((value, context) =>
    isContactPage(context.document) && !value?.length ? "Required" : true,
  );
}

export const globalPageType = defineType({
  name: "globalPage",
  title: "Global Page",
  type: "document",
  icon: DocumentIcon,
  fields: [
    // `pageType` is derived from structure.ts
    defineField({
      name: "pageType",
      title: "Page type",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
      options: {
        list: globalPageTypes.map(({ value, title }) => ({ value, title })),
      },
    }),
    defineField({
      name: "pageCover",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageComponents",
      type: "pageComponents",
      hidden: ({ document }) => isContactPage(document) || hasMap(document),
    }),
    defineField({
      name: "componentsBeforeMap",
      title: "Before the map",
      type: "pageComponents",
      hidden: ({ document }) => !hasMap(document),
    }),
    defineField({
      name: "venuesCta",
      title: "Map section call to action",
      description: "The button under the list of venues. Leave empty for none.",
      type: "cta",
      hidden: ({ document }) => !hasMap(document),
    }),
    defineField({
      name: "componentsAfterMap",
      title: "After the map",
      type: "pageComponents",
      hidden: ({ document }) => !hasMap(document),
    }),
    defineField({
      name: "teamTitle",
      title: "Team section title",
      type: "internationalizedArrayString",
      hidden: ({ document }) => !isContactPage(document),
      validation: requiredOnContactPage,
    }),
    defineField({
      name: "teamIntro",
      title: "Team section intro",
      type: "internationalizedArrayString",
      hidden: ({ document }) => !isContactPage(document),
    }),
    defineField({
      name: "venuesTitle",
      title: "Venues section title",
      type: "internationalizedArrayString",
      hidden: ({ document }) => !isContactPage(document),
      validation: requiredOnContactPage,
    }),
    defineField({
      name: "venuesIntro",
      title: "Venues section intro",
      type: "internationalizedArrayString",
      hidden: ({ document }) => !isContactPage(document),
    }),
  ],
  preview: {
    select: {
      pageType: "pageType",
    },
    prepare({ pageType }) {
      const title = globalPageTypes.find(
        ({ value }) => value === pageType,
      )?.title;

      return {
        title: title ?? "Global Page",
      };
    },
  },
});
