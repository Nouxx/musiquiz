import { defineArrayMember, defineField, defineType } from "sanity";
import { frenchValue, type LocalizedEntry } from "../frenchValue";

type CarouselParent = {
  cta?: { label?: LocalizedEntry[] };
};

export const carouselType = defineType({
  name: "carousel",
  title: "Carrousel",
  type: "object",
  fields: [
    defineField({
      name: "badge",
      title: "Badge",
      description: "The small tilted pill above the title.",
      type: "internationalizedArrayString",
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cta",
      title: "Call to action",
      type: "cta",
    }),
    defineField({
      name: "ctaTone",
      title: "Call to action color",
      description: "The color of the button.",
      type: "string",
      initialValue: "red",
      // nothing to tone until there is a button to tone
      hidden: ({ parent }) =>
        !(parent as CarouselParent | undefined)?.cta?.label?.length,
      options: {
        list: [
          { title: "Red", value: "red" },
          { title: "Blue", value: "blue" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "images",
      title: "Images",
      description:
        "Between 5 and 12. Each one is cropped hard to a tall portrait from its centre, so pick photos whose subject sits in the middle and survives losing most of its width.",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (rule) => rule.required().min(5).max(12),
      // deliberately NOT `options: { layout: "grid" }`
      // this makes the alt un-authorable
      // because internationalizedArrayString (array) is rendered as grid cells as well
    }),
  ],
  preview: {
    select: {
      title: "title",
      images: "images",
    },
    prepare({
      title,
      images,
    }: {
      title?: LocalizedEntry[];
      images?: unknown[];
    }) {
      const count = images?.length ?? 0;

      return {
        title: frenchValue(title) ?? "Carrousel",
        subtitle: `Carrousel · ${count} image${count === 1 ? "" : "s"}`,
      };
    },
  },
});
