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
      name: "body",
      title: "Body",
      description:
        "Paragraphs, bold and links, nothing else — no title, no button. An empty line between two paragraphs is drawn as a real gap, so break the copy up rather than writing one block.",
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
