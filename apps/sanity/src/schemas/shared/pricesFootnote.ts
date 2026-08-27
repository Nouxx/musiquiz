import { defineField, defineType } from "sanity";

export const pricesFootnoteType = defineType({
  name: "pricesFootnote",
  title: "Footnote",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayText",
      validation: (rule) => rule.required(),
    }),
  ],
});
