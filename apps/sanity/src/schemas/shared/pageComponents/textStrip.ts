import { defineArrayMember, defineField, defineType } from "sanity";
import { frenchValue, type LocalizedEntry } from "../localized";
import { anchorField, withAnchor } from "../anchorField";

export const textStripType = defineType({
  name: "textStrip",
  title: "Text Strip",
  type: "object",
  fields: [
    defineField({
      name: "textBlock",
      title: "Text",
      description: "The column of copy beside the photo strip.",
      type: "textBlock",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      description:
        "Between 6 and 12, shown beside the copy on a big screen only, in two columns drifting past each other. Each one is cropped hard to a tall portrait from its centre, so pick photos whose subject sits in the middle.",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (rule) => rule.required().min(6).max(12),
      // deliberately NOT `options: { layout: "grid" }`
      // this makes the alt un-authorable
      // because internationalizedArrayString (array) is rendered as grid cells as well
    }),
    anchorField,
  ],
  preview: {
    select: {
      anchor: "anchor",
      title: "textBlock.title",
      images: "images",
    },
    prepare({
      anchor,
      title,
      images,
    }: {
      anchor?: string;
      title?: LocalizedEntry[];
      images?: unknown[];
    }) {
      const count = images?.length ?? 0;

      return {
        title: frenchValue(title) ?? "Text Strip",
        subtitle: withAnchor(
          `Text Strip · ${count} image${count === 1 ? "" : "s"}`,
          anchor,
        ),
      };
    },
  },
});
