import { defineField, defineType } from "sanity";
import { BlockContentIcon } from "@sanity/icons/BlockContent";

// french only, plain strings on purpose: docs/adr/0013
export const blogPageType = defineType({
  name: "blogPage",
  title: "Blog page",
  type: "document",
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Blog page" };
    },
  },
});
