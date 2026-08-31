import { defineArrayMember, defineField, defineType } from "sanity";
import { frenchValue, type LocalizedEntry } from "../frenchValue";
import { contentIcons } from "./contentIcons";

type OfferCardParent = {
  quotation?: boolean;
  contentType?: "list" | "text";
};

type OffersParent = {
  layout?: "cards" | "groups";
};

export const offerListItemType = defineType({
  name: "offerListItem",
  title: "List item",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { text: "text" },
    prepare({ text }: { text?: LocalizedEntry[] }) {
      return { title: frenchValue(text) ?? "List item" };
    },
  },
});

export const offerCardType = defineType({
  name: "offerCard",
  title: "Offer card",
  type: "object",
  fieldsets: [
    { name: "price", title: "Prix", options: { collapsible: false } },
    { name: "content", title: "Contenu", options: { collapsible: false } },
  ],
  fields: [
    defineField({
      name: "icon",
      title: "Icon",
      description: "Sits in the round chip at the top of the card.",
      type: "string",
      options: { list: contentIcons },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subTitle",
      title: "Subtitle",
      description:
        "Optional. One short line under the title, for who or how many the offer is for.",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "quotation",
      title: "On quote",
      description: "Draws “Sur devis” instead of a price.",
      type: "boolean",
      fieldset: "price",
      initialValue: false,
    }),
    defineField({
      name: "amount",
      title: "Amount",
      description: "In euros, without the currency.",
      type: "number",
      fieldset: "price",
      hidden: ({ parent }) =>
        Boolean((parent as OfferCardParent | undefined)?.quotation),
      validation: (rule) =>
        rule.min(0).custom((value: number | undefined, context) => {
          const parent = context.parent as OfferCardParent | undefined;

          if (parent?.quotation) return true;

          return value === undefined
            ? "Required unless the price is on quote."
            : true;
        }),
    }),
    defineField({
      name: "label",
      title: "Unit",
      description:
        "Optional. Drawn smaller beside the amount. Starts with “/” to sit tight against it — “HT/joueur” reads “28€ HT/joueur”, “/enfant” reads “36€/enfant”.",
      type: "internationalizedArrayString",
      fieldset: "price",
      hidden: ({ parent }) =>
        Boolean((parent as OfferCardParent | undefined)?.quotation),
    }),
    defineField({
      name: "contentType",
      title: "Content",
      type: "string",
      fieldset: "content",
      initialValue: "list",
      options: {
        list: [
          { title: "Bullet list", value: "list" },
          { title: "Paragraph", value: "text" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Lead-in",
      description:
        "Optional. The coloured line above the bullets — “Une formule complète comprenant :”.",
      type: "internationalizedArrayString",
      fieldset: "content",
      hidden: ({ parent }) =>
        (parent as OfferCardParent | undefined)?.contentType === "text",
    }),
    defineField({
      name: "items",
      title: "Bullets",
      type: "array",
      of: [defineArrayMember({ type: "offerListItem" })],
      fieldset: "content",
      hidden: ({ parent }) =>
        (parent as OfferCardParent | undefined)?.contentType === "text",
      validation: (rule) =>
        rule.custom((value: unknown[] | undefined, context) => {
          const parent = context.parent as OfferCardParent | undefined;

          if (parent?.contentType === "text") return true;

          return value?.length ? true : "At least one bullet.";
        }),
    }),
    defineField({
      name: "body",
      title: "Paragraph",
      type: "internationalizedArrayRichText",
      fieldset: "content",
      hidden: ({ parent }) =>
        (parent as OfferCardParent | undefined)?.contentType !== "text",
      validation: (rule) =>
        rule.custom((value: unknown[] | undefined, context) => {
          const parent = context.parent as OfferCardParent | undefined;

          if (parent?.contentType !== "text") return true;

          return value?.length ? true : "Required.";
        }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subTitle: "subTitle",
    },
    prepare({
      title,
      subTitle,
    }: {
      title?: LocalizedEntry[];
      subTitle?: LocalizedEntry[];
    }) {
      return {
        title: frenchValue(title) ?? "Offer card",
        subtitle: frenchValue(subTitle),
      };
    },
  },
});

export const offerGroupType = defineType({
  name: "offerGroup",
  title: "Offer group",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tone",
      title: "Card color",
      description: "The colour of the ring around this group's cards.",
      type: "string",
      initialValue: "blue",
      options: {
        list: [
          { title: "Blue", value: "blue" },
          { title: "Red", value: "red" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "cards",
      title: "Cards",
      description: "One or two. Both groups draw their cards on the same row.",
      type: "array",
      of: [defineArrayMember({ type: "offerCard" })],
      validation: (rule) => rule.required().min(1).max(2),
    }),
  ],
  preview: {
    select: {
      title: "title",
      cards: "cards",
    },
    prepare({ title, cards }: { title?: LocalizedEntry[]; cards?: unknown[] }) {
      const count = cards?.length ?? 0;

      return {
        title: frenchValue(title) ?? "Offer group",
        subtitle: `${count} card${count === 1 ? "" : "s"}`,
      };
    },
  },
});

export const offersType = defineType({
  name: "offers",
  title: "Offers",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subTitle",
      title: "Subtitle",
      description: "Optional. One line under the title, drawn lighter.",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "background",
      title: "Background",
      type: "string",
      initialValue: "default",
      options: {
        list: [
          { title: "White", value: "default" },
          { title: "Muted", value: "muted" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "venue",
      title: "Venue",
      description: "Where the booking button leads.",
      type: "reference",
      to: [{ type: "venue" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cta",
      title: "Call to action",
      description:
        "Optional. The booking button beside it is always there, and leads to this venue's booking page.",
      type: "cta",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      initialValue: "cards",
      options: {
        list: [
          { title: "One row of cards", value: "cards" },
          { title: "Two groups", value: "groups" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cards",
      title: "Cards",
      description: "Two to four, on one row.",
      type: "array",
      of: [defineArrayMember({ type: "offerCard" })],
      hidden: ({ parent }) =>
        (parent as OffersParent | undefined)?.layout === "groups",
      validation: (rule) =>
        rule
          .min(2)
          .max(4)
          .custom((value: unknown[] | undefined, context) => {
            const parent = context.parent as OffersParent | undefined;

            if (parent?.layout === "groups") return true;

            return value?.length ? true : "Required.";
          }),
    }),
    defineField({
      name: "groups",
      title: "Groups",
      description: "Exactly two. One group alone is the same page without one.",
      type: "array",
      of: [defineArrayMember({ type: "offerGroup" })],
      hidden: ({ parent }) =>
        (parent as OffersParent | undefined)?.layout !== "groups",
      validation: (rule) =>
        rule.custom((value: unknown[] | undefined, context) => {
          const parent = context.parent as OffersParent | undefined;

          if (parent?.layout !== "groups") return true;

          return value?.length === 2 ? true : "Exactly two groups.";
        }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      layout: "layout",
      venueTitle: "venue.title",
    },
    prepare({
      title,
      layout,
      venueTitle,
    }: {
      title?: LocalizedEntry[];
      layout?: string;
      venueTitle?: string;
    }) {
      return {
        title: frenchValue(title) ?? "Offers",
        subtitle: [
          "Offers",
          layout === "groups" ? "2 groups" : "cards",
          venueTitle,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
