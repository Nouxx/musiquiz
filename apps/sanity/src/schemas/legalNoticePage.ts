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
    // todo: should remove this, only a textBody is allowed
    defineField({
      name: "pageComponents",
      type: "pageComponents",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Legal notice page" };
    },
  },
});
