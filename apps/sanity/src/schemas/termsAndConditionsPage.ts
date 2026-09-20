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
      name: "pageComponents",
      type: "pageComponents",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Terms and conditions page" };
    },
  },
});
