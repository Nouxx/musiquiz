import { defineField, defineType } from "sanity";
import { noMissingLanguage } from "./localized";

export const pricesFootnoteType = defineType({
  name: "pricesFootnote",
  title: "Footnote",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.custom(noMissingLanguage),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayText",
      validation: (rule) => rule.custom(noMissingLanguage),
    }),
  ],
});
