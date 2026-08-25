import { defineField, defineType, type PreviewValue } from "sanity";
import { frenchValue, type LocalizedEntry } from "../frenchValue";

export const findUsType = defineType({
  name: "findUs",
  title: "Find Us",
  type: "object",
  fieldsets: [
    { name: "address", title: "Adresse", options: { collapsible: false } },
    { name: "hours", title: "Horaires", options: { collapsible: false } },
    { name: "contact", title: "Contact", options: { collapsible: false } },
  ],
  fields: [
    defineField({
      name: "media",
      title: "Background photo",
      description:
        "Sits behind the whole section, under a dark wash. Pick something that reads at full width with text over it.",
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
      name: "venue",
      title: "Venue",
      description:
        "Supplies the address shown in the first row, the map, and where the button leads. The map itself is generated from this venue's coordinates.",
      type: "reference",
      to: [{ type: "venue" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "addressNote",
      title: "Note",
      description:
        "The small line under the address. The address itself comes from the venue.",
      type: "internationalizedArrayText",
      fieldset: "address",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "openingTitle",
      title: "Title",
      type: "internationalizedArrayString",
      fieldset: "hours",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "openingNote",
      title: "Note",
      type: "internationalizedArrayText",
      fieldset: "hours",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contactTitle",
      title: "Title",
      type: "internationalizedArrayString",
      fieldset: "contact",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contactNote",
      title: "Note",
      type: "internationalizedArrayText",
      fieldset: "contact",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      venueTitle: "venue.title",
      media: "media",
    },
    prepare({
      title,
      venueTitle,
      media,
    }: {
      title?: LocalizedEntry[];
      venueTitle?: string;
      media?: PreviewValue["media"];
    }) {
      return {
        title: frenchValue(title) ?? "Find Us",
        subtitle: ["Find Us", venueTitle].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
