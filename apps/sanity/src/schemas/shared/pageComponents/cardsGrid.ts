import {
  defineArrayMember,
  defineField,
  defineType,
  type PreviewValue,
} from "sanity";

type LocalizedEntry = { _key?: string; value?: string };

function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry._key === "fr")?.value ?? entries?.[0]?.value
  );
}

export const cardType = defineType({
  name: "card",
  title: "Card",
  type: "object",
  fields: [
    defineField({
      name: "media",
      title: "Media",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "badge",
      title: "Badge",
      description: "The small tilted pill above the title.",
      type: "internationalizedArrayString",
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
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "cta",
      title: "Call to action",
      type: "cta",
    }),
  ],
  preview: {
    select: {
      title: "title",
      badge: "badge",
      media: "media",
    },
    prepare({
      title,
      badge,
      media,
    }: {
      title?: LocalizedEntry[];
      badge?: LocalizedEntry[];
      media?: PreviewValue["media"];
    }) {
      return {
        title: frenchValue(title) ?? "Card",
        subtitle: frenchValue(badge),
        media,
      };
    },
  },
});

export const cardsGridType = defineType({
  name: "cardsGrid",
  title: "Cards Grid",
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
      name: "align",
      title: "Alignment",
      description:
        "Left puts the call to action beside the heading. Center stacks everything in one column.",
      type: "string",
      initialValue: "left",
      validation: (rule) => rule.required(),
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "background",
      title: "Background",
      type: "string",
      initialValue: "muted",
      validation: (rule) => rule.required(),
      options: {
        list: [
          { title: "Muted", value: "muted" },
          { title: "Vivid", value: "vivid" },
        ],
        layout: "radio",
      },
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
        "Three or four. Three gives the larger card, with room for a body and a button; four gives the shorter one.",
      type: "array",
      of: [defineArrayMember({ type: "card" })],
      validation: (rule) => rule.required().min(3).max(4),
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
        title: frenchValue(heading) ?? "Cards Grid",
        subtitle: `Cards Grid · ${count} card${count === 1 ? "" : "s"}`,
      };
    },
  },
});
