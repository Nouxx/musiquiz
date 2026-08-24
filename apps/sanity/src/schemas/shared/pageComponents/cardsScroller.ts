import { defineField, defineType } from "sanity";

type LocalizedEntry = { _key?: string; value?: string };

function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry._key === "fr")?.value ?? entries?.[0]?.value
  );
}

export const cardsScrollerType = defineType({
  name: "cardsScroller",
  title: "Cards Scroller",
  type: "object",
  fields: [
    defineField({
      name: "textBlock",
      title: "Text",
      description: "The column of copy. The cards beside it come later.",
      type: "textBlock",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "textBlock.title",
    },
    prepare({ title }: { title?: LocalizedEntry[] }) {
      return {
        title: frenchValue(title) ?? "Cards Scroller",
        subtitle: "Cards Scroller",
      };
    },
  },
});
