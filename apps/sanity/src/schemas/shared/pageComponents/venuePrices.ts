import { defineField, defineType } from "sanity";

type LocalizedEntry = { _key?: string; value?: string };

function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry._key === "fr")?.value ?? entries?.[0]?.value
  );
}

export const venuePricesType = defineType({
  name: "venuePrices",
  title: "Venue Prices",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "surface",
      title: "Background",
      type: "string",
      initialValue: "muted",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Muted", value: "muted" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "venue",
      title: "Venue",
      description: "Every game this venue runs is listed.",
      type: "reference",
      to: [{ type: "venue" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "footnote",
      title: "Footnote",
      description:
        "An optional panel under the buttons, for something worth reassuring a visitor about. Fill both fields or neither.",
      type: "pricesFootnote",
    }),
    defineField({
      name: "cta",
      title: "Call to action",
      description:
        "An optional button beside the booking one, for an offer worth pointing at. Leave it empty and only the booking button shows.",
      type: "cta",
    }),
  ],
  preview: {
    select: {
      title: "title",
      venueTitle: "venue.title",
    },
    prepare({
      title,
      venueTitle,
    }: {
      title?: LocalizedEntry[];
      venueTitle?: string;
    }) {
      return {
        title: frenchValue(title) ?? "Venue Prices",
        subtitle: ["Venue Prices", venueTitle].filter(Boolean).join(" · "),
      };
    },
  },
});
