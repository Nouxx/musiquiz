import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons/Document";

export const globalPageTypes = [
  { value: "franchise", title: "Join the network page" },
] as const;

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
