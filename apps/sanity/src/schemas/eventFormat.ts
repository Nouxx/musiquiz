import { defineField, defineType } from "sanity";
import { ConfettiIcon } from "@sanity/icons/Confetti";

export const eventFormatType = defineType({
  name: "eventFormat",
  title: "Event format",
  type: "document",
  icon: ConfettiIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      description:
        "Where this event sits wherever events are listed. Lower comes first. The order is the same at every venue.",
      type: "number",
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      description:
        'How the event name will appear in a URL. Use the "Generate" button.',
      validation: (rule) => rule.required(),
      hidden: ({ document }) => !document?.name,
      // once the slug is published, it cant be edited anymore
      readOnly: ({ document }) => {
        const id = document?._id;
        return !id?.startsWith("drafts.");
      },
      options: {
        source: "name",
      },
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
