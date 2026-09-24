import { defineField, defineType } from "sanity";
import { BookIcon } from "@sanity/icons/Book";

export const termsAndConditionsPageType = defineType({
  name: "termsAndConditionsPage",
  title: "Terms and conditions page",
  type: "document",
  icon: BookIcon,
  fields: [
    defineField({
      name: "pageCover",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      description:
        "Shown between the list of venues and the first venue's terms: what a visitor should do when their venue is not listed. Paragraphs, bold and links, nothing else.",
      type: "internationalizedArrayRichText",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Terms and conditions page" };
    },
  },
});
