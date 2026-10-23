import {
  defineArrayMember,
  defineField,
  defineType,
  type PreviewValue,
} from "sanity";
import {
  frenchValue,
  type LocalizedEntry,
  requiredInEveryLanguage,
} from "../localized";
import { iconField } from "../iconField";
import { anchorField, withAnchor } from "../anchorField";

export const textCardType = defineType({
  name: "textCard",
  title: "Text card",
  type: "object",
  fields: [
    iconField({
      description: "Sits in the round white chip at the top of the card.",
    }),
    defineField({
      name: "body",
      title: "Body",
      description:
        "One sentence. The card is as tall as this text, so keep the three or four of them roughly the same length.",
      type: "internationalizedArrayString",
      validation: (rule) => rule.custom(requiredInEveryLanguage()),
    }),
    defineField({
      name: "media",
      title: "Media",
      description:
        "Fills the card behind a dark gradient, cropped from its centre. Pick a photo whose subject sits in the middle.",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      body: "body",
      icon: "icon",
      media: "media",
    },
    prepare({
      body,
      icon,
      media,
    }: {
      body?: LocalizedEntry[];
      icon?: string;
      media?: PreviewValue["media"];
    }) {
      return {
        title: frenchValue(body) ?? "Text card",
        subtitle: icon,
        media,
      };
    },
  },
});

export const textCardsType = defineType({
  name: "textCards",
  title: "Text Cards",
  type: "object",
  fields: [
    defineField({
      name: "textBlock",
      title: "Text",
      description: "The column of copy beside the cards.",
      type: "textBlock",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cards",
      title: "Cards",
      description:
        "Three or four, stacked beside the copy on a big screen and below it on a phone.",
      type: "array",
      of: [defineArrayMember({ type: "textCard" })],
      validation: (rule) => rule.required().min(3).max(4),
      // deliberately NOT `options: { layout: "grid" }`, see textSlideshow
    }),
    anchorField,
  ],
  preview: {
    select: {
      anchor: "anchor",
      title: "textBlock.title",
      cards: "cards",
    },
    prepare({
      anchor,
      title,
      cards,
    }: {
      anchor?: string;
      title?: LocalizedEntry[];
      cards?: unknown[];
    }) {
      const count = cards?.length ?? 0;

      return {
        title: frenchValue(title) ?? "Text Cards",
        subtitle: withAnchor(
          `Text Cards · ${count} card${count === 1 ? "" : "s"}`,
          anchor,
        ),
      };
    },
  },
});
