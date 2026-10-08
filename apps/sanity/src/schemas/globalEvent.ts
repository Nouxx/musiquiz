import { defineField, defineType } from "sanity";
import { ConfettiIcon } from "@sanity/icons/Confetti";
import { pageGroups } from "./shared/seo";

export const globalEventType = defineType({
  name: "globalEvent",
  title: "Global Event",
  type: "document",
  icon: ConfettiIcon,
  groups: pageGroups,
  fields: [
    defineField({
      name: "event",
      group: "content",
      title: "Event",
      type: "reference",
      to: [{ type: "eventFormat" }],
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageCover",
      group: "content",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageComponents",
      group: "content",
      type: "pageComponents",
    }),
    defineField({
      name: "seo",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "event.name" },
  },
});
