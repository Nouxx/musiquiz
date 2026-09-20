import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";

export const legalNoticePageType = defineType({
  name: "legalNoticePage",
  title: "Legal notice page",
  type: "document",
  icon: DocumentTextIcon,
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
      return { title: "Legal notice page" };
    },
  },
});
