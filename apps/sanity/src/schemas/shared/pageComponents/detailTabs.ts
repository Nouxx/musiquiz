import { defineArrayMember, defineField, defineType } from "sanity";
import { frenchValue, type LocalizedEntry } from "../frenchValue";

const DETAIL_ICONS = [{ title: "Game", value: "game" }];

export const detailCardType = defineType({
  name: "detailCard",
  title: "Detail card",
  type: "object",
  fields: [
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: { list: DETAIL_ICONS, layout: "dropdown" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Lead-in",
      description:
        "Optional. One sentence setting the card up, drawn lighter above the closing one.",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "highlight",
      title: "Closing sentence",
      description:
        "Drawn heavier on every card, so this is where the sentence goes rather than where the emphasis goes. Write the point the card lands on, not the part you want to stand out.",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      icon: "icon",
    },
    prepare({ title, icon }: { title?: LocalizedEntry[]; icon?: string }) {
      return {
        title: frenchValue(title) ?? "Detail card",
        subtitle: icon,
      };
    },
  },
});

export const detailGroupType = defineType({
  name: "detailGroup",
  title: "Detail group",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      description:
        "The label on the tab. Two or three words: four tabs share the width of two cards.",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cards",
      title: "Cards",
      description: "Two to six, in this order.",
      type: "array",
      of: [defineArrayMember({ type: "detailCard" })],
      validation: (rule) => rule.required().min(2).max(6),
    }),
  ],
  preview: {
    select: {
      name: "name",
      cards: "cards",
    },
    prepare({ name, cards }: { name?: LocalizedEntry[]; cards?: unknown[] }) {
      const count = cards?.length ?? 0;

      return {
        title: frenchValue(name) ?? "Detail group",
        subtitle: `${count} card${count === 1 ? "" : "s"}`,
      };
    },
  },
});

export const detailTabsType = defineType({
  name: "detailTabs",
  title: "Detail Tabs",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "groups",
      title: "Groups",
      description:
        "One to four. A visitor sees one at a time and picks between them; with a single group there is no picker and its cards simply show.",
      type: "array",
      of: [defineArrayMember({ type: "detailGroup" })],
      validation: (rule) => rule.required().min(1).max(4),
    }),
    defineField({
      name: "images",
      title: "Images",
      description:
        "Between 6 and 12, shown beside the cards on a big screen only, in two columns drifting past each other. Each one is cropped hard to a tall portrait from its centre, so pick photos whose subject sits in the middle.",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (rule) => rule.required().min(6).max(12),
      // deliberately NOT `options: { layout: "grid" }`
      // this makes the alt un-authorable
      // because internationalizedArrayString (array) is rendered as grid cells as well
    }),
  ],
  preview: {
    select: {
      title: "title",
      groups: "groups",
      images: "images",
    },
    prepare({
      title,
      groups,
      images,
    }: {
      title?: LocalizedEntry[];
      groups?: unknown[];
      images?: unknown[];
    }) {
      const groupCount = groups?.length ?? 0;
      const imageCount = images?.length ?? 0;

      return {
        title: frenchValue(title) ?? "Detail Tabs",
        subtitle: `Detail Tabs · ${groupCount} group${groupCount === 1 ? "" : "s"} · ${imageCount} image${imageCount === 1 ? "" : "s"}`,
      };
    },
  },
});
