import { defineField, defineType } from "sanity";

type LocalizedEntry = { _key?: string; value?: string };

function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry._key === "fr")?.value ?? entries?.[0]?.value
  );
}

export const pricesType = defineType({
  name: "prices",
  title: "Prices",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "surface",
      title: "Background",
      type: "string",
      initialValue: "muted",
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
    },
    prepare({ title }: { title?: LocalizedEntry[] }) {
      return {
        title: frenchValue(title) ?? "Prices",
        subtitle: "Prices",
      };
    },
  },
});
