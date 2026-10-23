import { defineField, defineType } from "sanity";
import { requiredInEveryLanguage } from "../localized";

type LocalizedRichText = {
  _key?: string;
  value?: { children?: { text?: string }[] }[];
};

function frenchExcerpt(entries?: LocalizedRichText[]) {
  const value =
    entries?.find((entry) => entry._key === "fr")?.value ?? entries?.[0]?.value;

  return value?.[0]?.children?.map((child) => child.text ?? "").join("");
}

export const textBodyType = defineType({
  name: "textBody",
  title: "Text Body",
  type: "object",
  fields: [
    defineField({
      name: "body",
      title: "Body",
      description:
        "Paragraphs, text styles and links, nothing else — no title, no button. An empty line between two paragraphs is drawn as a real gap, so break the copy up rather than writing one block. Shift+Enter breaks the line without starting a paragraph.",
      type: "internationalizedArrayRichText",
      validation: (rule) => rule.custom(requiredInEveryLanguage()),
    }),
  ],
  preview: {
    select: {
      body: "body",
    },
    prepare({ body }: { body?: LocalizedRichText[] }) {
      return {
        title: "Text Body",
        subtitle: frenchExcerpt(body),
      };
    },
  },
});
