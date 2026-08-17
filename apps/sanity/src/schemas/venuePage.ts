import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons/Document";

export const pageTypes = [
  { value: "home", title: "Home page" },
  { value: "gift", title: "Gift page" },
  { value: "book", title: "Booking page" },
] as const;

export const venuePageType = defineType({
  name: "venuePage",
  title: "Venue Page",
  type: "document",
  icon: DocumentIcon,
  fields: [
    // `venue` and `pageType` are derived from structure.ts
    defineField({
      name: "venue",
      title: "Venue",
      type: "reference",
      to: [{ type: "venue" }],
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageType",
      title: "Page type",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
      options: {
        list: pageTypes.map(({ value, title }) => ({ value, title })),
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
    }),
  ],
  preview: {
    select: {
      venueTitle: "venue.title",
      pageType: "pageType",
    },
    prepare({ venueTitle, pageType }) {
      const title = pageTypes.find(({ value }) => value === pageType)?.title;

      return {
        title: title ?? "Venue Page",
        subtitle: venueTitle,
      };
    },
  },
});
