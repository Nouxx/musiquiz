import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { pageGroups } from "./shared/seo";

export const legalNoticePageType = defineType({
  name: "legalNoticePage",
  title: "Legal notice page",
  type: "document",
  icon: DocumentTextIcon,
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
      name: "body",
      group: "content",
      title: "Body",
      description:
        "Paragraphs, bold and links, nothing else — no title, no button. An empty line between two paragraphs is drawn as a real gap, so break the copy up rather than writing one block.",
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
      return { title: "Legal notice page" };
    },
  },
});
