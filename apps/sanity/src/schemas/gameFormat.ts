import { defineField, defineType } from "sanity";
import { JoystickIcon } from "@sanity/icons/Joystick";

export const gameFormatType = defineType({
  name: "gameFormat",
  title: "Game format",
  type: "document",
  icon: JoystickIcon,
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
        "Where this game sits wherever games are listed. Lower comes first. The order is the same at every venue.",
      type: "number",
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      description:
        'How the game name will appear in a URL. Use the "Generate" button.',
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
