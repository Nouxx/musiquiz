import { defineArrayMember, defineField, defineType } from "sanity";

type LocalizedEntry = { _key?: string; value?: string };

function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry._key === "fr")?.value ?? entries?.[0]?.value
  );
}

type TextBlockParent = {
  cta?: { label?: LocalizedEntry[] };
};

export const textBlockType = defineType({
  name: "textBlock",
  title: "Text block",
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
      description:
        "Paragraphs, bold and links. An empty line between two paragraphs is drawn as a real gap, so break the copy up rather than writing one block.",
      type: "internationalizedArrayRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "additionalCtas",
      title: "Additional links",
      description:
        "Up to three. The small arrow links between the copy and the button — for pages the button does not go to.",
      type: "array",
      of: [defineArrayMember({ type: "cta" })],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "cta",
      title: "Call to action",
      description: "The button at the bottom of the block.",
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
        !(parent as TextBlockParent | undefined)?.cta?.label?.length,
      options: {
        list: [
          { title: "Red", value: "red" },
          { title: "Blue", value: "blue" },
        ],
        layout: "radio",
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      badge: "badge",
    },
    prepare({
      title,
      badge,
    }: {
      title?: LocalizedEntry[];
      badge?: LocalizedEntry[];
    }) {
      return {
        title: frenchValue(title) ?? "Text block",
        subtitle: frenchValue(badge),
      };
    },
  },
});
