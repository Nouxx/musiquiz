import { defineField, defineType } from "sanity";
import { JoystickIcon } from "@sanity/icons/Joystick";
import { pageGroups } from "./shared/seo";

export const globalGameType = defineType({
  name: "globalGame",
  title: "Global Game",
  type: "document",
  icon: JoystickIcon,
  groups: pageGroups,
  fields: [
    defineField({
      name: "game",
      group: "content",
      title: "Game",
      type: "reference",
      to: [{ type: "gameFormat" }],
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
    select: { title: "game.name" },
  },
});
