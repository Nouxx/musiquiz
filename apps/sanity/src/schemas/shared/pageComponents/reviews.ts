import { defineField, defineType } from "sanity";
import {
  frenchValue,
  type LocalizedEntry,
  requiredInEveryLanguage,
} from "../localized";

export const reviewsType = defineType({
  name: "reviews",
  title: "Reviews",
  type: "object",
  fields: [
    defineField({
      name: "widgetId",
      title: "Trustindex widget ID",
      description:
        "Each reviews block needs its own widget, created in Trustindex. The ID is the text after '?' in the embed code, ex: 'xxx' in https://cdn.trustindex.io/loader.js?xxx",
      type: "string",
      validation: (rule) => [rule.required()],
    }),
    defineField({
      name: "badge",
      title: "Badge",
      description: "The small tilted pill above the title.",
      type: "internationalizedArrayString",
      initialValue: [
        {
          _type: "internationalizedArrayStringValue",
          language: "fr",
          value: "Témoignages",
        },
        {
          _type: "internationalizedArrayStringValue",
          language: "en",
          value: "Testimonials",
        },
      ],
      validation: (rule) => rule.custom(requiredInEveryLanguage()),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      initialValue: [
        {
          _type: "internationalizedArrayStringValue",
          language: "fr",
          value: "Ils ont testé... et approuvé !",
        },
        {
          _type: "internationalizedArrayStringValue",
          language: "en",
          value: "They tried it... and loved it!",
        },
      ],
      validation: (rule) => rule.custom(requiredInEveryLanguage()),
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
      title: "title",
      widgetId: "widgetId",
    },
    prepare({ title }: { title?: LocalizedEntry[] }) {
      return {
        title: frenchValue(title) ?? "Reviews",
        subtitle: "Reviews",
      };
    },
  },
});
