import { defineField, defineType } from "sanity";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { pageGroups } from "./shared/seo";

export const globalBookingPageType = defineType({
  name: "globalBookingPage",
  title: "Booking page",
  type: "document",
  icon: CalendarIcon,
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
      name: "seo",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Booking page" };
    },
  },
});
