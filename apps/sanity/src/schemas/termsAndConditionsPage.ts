import { defineField, defineType } from "sanity";
import { BookIcon } from "@sanity/icons/Book";
import { pageGroups } from "./shared/seo";

export const termsAndConditionsPageType = defineType({
  name: "termsAndConditionsPage",
  title: "Terms and conditions page",
  type: "document",
  icon: BookIcon,
  groups: pageGroups,
  fields: [
    defineField({
      name: "pageCover",
      group: "content",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      group: "content",
      title: "Intro",
      description:
        "Shown between the list of venues and the first venue's terms: what a visitor should do when their venue is not listed. Paragraphs, bold and links, nothing else.",
      type: "internationalizedArrayRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Terms and conditions page" };
    },
  },
});
