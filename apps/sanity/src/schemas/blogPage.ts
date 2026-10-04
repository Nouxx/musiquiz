import { defineField, defineType } from "sanity";
import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { pageGroups } from "./shared/seo";

// french only, plain strings on purpose: docs/adr/0013
export const blogPageType = defineType({
  name: "blogPage",
  title: "Blog page",
  type: "document",
  icon: BlockContentIcon,
  groups: pageGroups,
  fields: [
    defineField({
      name: "title",
      group: "content",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      group: "content",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      type: "blogSeo",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Blog page" };
    },
  },
});
