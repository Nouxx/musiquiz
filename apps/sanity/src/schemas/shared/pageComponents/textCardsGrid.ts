import { defineArrayMember, defineField, defineType } from "sanity";
import { frenchValue, type LocalizedEntry } from "../frenchValue";
import { contentIcons } from "./contentIcons";

export const keywordCardType = defineType({
  name: "keywordCard",
  title: "Keyword card",
  type: "object",
  fields: [
    defineField({
      name: "badge",
      title: "Badge",
      description: "The small tilted pill, beside the icon.",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      description: "Sits in the round chip at the top right of the card.",
      type: "string",
      options: { list: contentIcons },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      description:
        "One short sentence. Cards on the same row are as tall as the longest one.",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      body: "body",
      badge: "badge",
    },
    prepare({
      body,
      badge,
    }: {
      body?: LocalizedEntry[];
      badge?: LocalizedEntry[];
    }) {
      return {
        title: frenchValue(body) ?? "Keyword card",
        subtitle: frenchValue(badge),
      };
    },
  },
});

export const textCardsGridType = defineType({
  name: "textCardsGrid",
  title: "Text Cards Grid",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cta",
      title: "Call to action",
      type: "cta",
    }),
    defineField({
      name: "cards",
      title: "Cards",
      description:
        "Three to six, on a three-column grid. Four or five leave a short last row.",
      type: "array",
      of: [defineArrayMember({ type: "keywordCard" })],
      validation: (rule) => rule.required().min(3).max(6),
    }),
  ],
  preview: {
    select: {
      heading: "heading",
      cards: "cards",
    },
    prepare({
      heading,
      cards,
    }: {
      heading?: LocalizedEntry[];
      cards?: unknown[];
    }) {
      const count = cards?.length ?? 0;

      return {
        title: frenchValue(heading) ?? "Text Cards Grid",
        subtitle: `Text Cards Grid · ${count} card${count === 1 ? "" : "s"}`,
      };
    },
  },
});
