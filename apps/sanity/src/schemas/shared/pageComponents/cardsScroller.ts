import {
  defineArrayMember,
  defineField,
  defineType,
  type PreviewValue,
} from "sanity";
import { frenchValue, type LocalizedEntry } from "../frenchValue";

export const deckCardType = defineType({
  name: "deckCard",
  title: "Deck card",
  type: "object",
  fields: [
    defineField({
      name: "media",
      title: "Media",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      description:
        "Paragraphs, bold and links. An empty line between two paragraphs is drawn as a real gap, so break the copy up rather than writing one block.",
      type: "internationalizedArrayRichText",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "media",
    },
    prepare({
      title,
      media,
    }: {
      title?: LocalizedEntry[];
      media?: PreviewValue["media"];
    }) {
      return {
        title: frenchValue(title) ?? "Deck card",
        subtitle: "Deck card",
        media,
      };
    },
  },
});

export const cardsScrollerType = defineType({
  name: "cardsScroller",
  title: "Cards Scroller",
  type: "object",
  fields: [
    defineField({
      name: "textBlock",
      title: "Text",
      description: "The column of copy beside the deck.",
      type: "textBlock",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cards",
      title: "Cards",
      description:
        "Two to six. They are stacked as a deck beside the copy, in this order, and a visitor clicks or swipes through them.",
      type: "array",
      of: [defineArrayMember({ type: "deckCard" })],
      validation: (rule) => rule.required().min(2).max(6),
    }),
  ],
  preview: {
    select: {
      title: "textBlock.title",
      cards: "cards",
    },
    prepare({ title, cards }: { title?: LocalizedEntry[]; cards?: unknown[] }) {
      const count = cards?.length ?? 0;

      return {
        title: frenchValue(title) ?? "Cards Scroller",
        subtitle: `Cards Scroller · ${count} card${count === 1 ? "" : "s"}`,
      };
    },
  },
});
