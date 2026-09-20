import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons/Document";

import { isLegalPage } from "./globalPage";

export const pageTypes = [
  { value: "home", title: "Home page" },
  { value: "gift", title: "Gift page" },
  { value: "book", title: "Booking page" },
] as const;

/**
 * The gifting and booking pages render a Widget the build owns, and bracket it
 * with two component arrays instead of the single one every other page has.
 * Mirrored by the split between `venuePage.ts` and `venueWidgetPage.ts` in
 * `packages/api`. See `docs/adr/0011-widget-pages-bracket-their-widget.md`.
 */
export function hasWidget(pageType: unknown) {
  return pageType === "gift" || pageType === "book";
}

/**
 * The booking and gifting covers take their buttons from the build: the url is
 * the anchor of the widget those pages render, which only `apps/web` knows.
 * The legal covers have no button at all.
 */
export function hasAuthorableCta(pageType: unknown) {
  return !hasWidget(pageType) && !isLegalPage(pageType);
}

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
      hidden: ({ document }) => hasWidget(document?.pageType),
    }),
    defineField({
      name: "componentsBeforeWidget",
      title: "Before the widget",
      type: "pageComponents",
      hidden: ({ document }) => !hasWidget(document?.pageType),
    }),
    defineField({
      name: "componentsAfterWidget",
      title: "After the widget",
      type: "pageComponents",
      hidden: ({ document }) => !hasWidget(document?.pageType),
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
