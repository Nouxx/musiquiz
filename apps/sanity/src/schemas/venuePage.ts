import {
  defineField,
  defineType,
  type Reference,
  type ValidationContext,
} from "sanity";
import { DocumentIcon } from "@sanity/icons/Document";
import { pageGroups } from "./shared/seo";

export const pageTypes = [
  { value: "home", title: "Home page" },
  { value: "gift", title: "Gift page" },
  { value: "book", title: "Booking page" },
] as const;

/**
 * The gifting and booking pages have a widget, owned by the build
 */
export function hasWidget(pageType: unknown) {
  return pageType === "gift" || pageType === "book";
}

async function unpublishedWithoutWidget(
  value: Reference | undefined,
  { document, getClient }: ValidationContext,
) {
  if (!value?._ref || !hasWidget(document?.pageType)) return true;

  const providerField =
    document?.pageType === "book" ? "bookingProvider" : "giftingProvider";
  const provider = await getClient({ apiVersion: "2025-02-06" }).fetch<
    string | null
  >(`*[_id == $id][0].${providerField}`, { id: value._ref });

  if (provider === "external") {
    return "Not published: this venue's provider is an external site.";
  }
  if (provider === "none") {
    return "Not published: this venue sells no vouchers.";
  }
  return true;
}

export const venuePageType = defineType({
  name: "venuePage",
  title: "Venue Page",
  type: "document",
  icon: DocumentIcon,
  groups: pageGroups,
  fields: [
    // `venue` and `pageType` are derived from structure.ts
    defineField({
      name: "venue",
      group: "content",
      title: "Venue",
      type: "reference",
      to: [{ type: "venue" }],
      readOnly: true,
      validation: (rule) => [
        rule.required(),
        rule.custom(unpublishedWithoutWidget).warning(),
      ],
    }),
    defineField({
      name: "pageType",
      group: "content",
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
      group: "content",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageComponents",
      group: "content",
      type: "pageComponents",
      hidden: ({ document }) => hasWidget(document?.pageType),
    }),
    defineField({
      name: "componentsBeforeWidget",
      group: "content",
      title: "Before the widget",
      type: "pageComponents",
      hidden: ({ document }) => !hasWidget(document?.pageType),
    }),
    defineField({
      name: "componentsAfterWidget",
      group: "content",
      title: "After the widget",
      type: "pageComponents",
      hidden: ({ document }) => !hasWidget(document?.pageType),
    }),
    defineField({
      name: "seo",
      type: "seo",
      group: "seo",
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
