import { defineArrayMember, defineField, defineType } from "sanity";

export const clientContactFormType = defineType({
  name: "clientContactForm",
  title: "Client Contact Form",
  type: "object",
  fields: [
    defineField({
      name: "images",
      title: "Images",
      description:
        "Shown beside the form, one at a time, on a big screen only. Each one fills a near-square frame from its centre, so pick photos whose subject sits in the middle. A single image turns the frame into a still picture, with no arrows.",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (rule) => rule.required().min(1).max(8),
      // deliberately NOT `options: { layout: "grid" }`
      // this makes the alt un-authorable
      // because internationalizedArrayString (array) is rendered as grid cells as well
    }),
  ],
  preview: {
    select: {
      images: "images",
    },
    prepare({ images }: { images?: unknown[] }) {
      const count = images?.length ?? 0;

      return {
        title: "Formulaire de contact",
        subtitle: `Formulaire de contact · ${count} image${count === 1 ? "" : "s"}`,
      };
    },
  },
});
