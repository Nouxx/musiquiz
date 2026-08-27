import { defineArrayMember, defineField, defineType } from "sanity";
import { frenchValue, type LocalizedEntry } from "../frenchValue";

export const textSlideshowType = defineType({
  name: "textSlideshow",
  title: "Text Slideshow",
  type: "object",
  fields: [
    defineField({
      name: "textBlock",
      title: "Text",
      description: "The column of copy beside the slideshow.",
      type: "textBlock",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      description:
        "Shown beside the copy, one at a time, on a big screen only. The frame is as tall as the copy and each image fills it from its centre, so pick photos whose subject sits in the middle. A single image turns the frame into a still picture, with no arrows.",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (rule) => rule.required().min(1).max(8),
      // deliberately NOT `options: { layout: "grid" }`
      // this makes the alt un-authorable
      // because internationalizedArrayString (array) is rendered as grid cells as well
    }),
    defineField({
      name: "slideshowPosition",
      title: "Slideshow position",
      description:
        "Which side the slideshow sits on, beside the copy. Big screens only \u2014 on a phone the copy stands alone whichever side you pick.",
      type: "string",
      initialValue: "right",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "surface",
      title: "Background",
      type: "string",
      initialValue: "default",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Muted", value: "muted" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "textBlock.title",
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
        title: frenchValue(title) ?? "Text Slideshow",
        subtitle: `Text Slideshow · ${count} image${count === 1 ? "" : "s"}`,
      };
    },
  },
});
