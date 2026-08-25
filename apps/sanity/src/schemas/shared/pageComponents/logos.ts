import { defineArrayMember, defineField, defineType } from "sanity";
import { frenchValue, type LocalizedEntry } from "../frenchValue";

type LogoMember = { alt?: LocalizedEntry[] };

function hasAlt(logo: LogoMember) {
  return logo.alt?.some((entry) => entry.value?.trim()) ?? false;
}

export const logosType = defineType({
  name: "logos",
  title: "Logos",
  type: "object",
  fields: [
    defineField({
      name: "layout",
      title: "Layout",
      description:
        "Inline puts the title on the left, beside the logos. Stacked centres it above them, and gives each logo a taller box — for portrait marks like an award badge or a guide cover.",
      type: "string",
      initialValue: "inline",
      options: {
        list: [
          { title: "Inline", value: "inline" },
          { title: "Stacked", value: "stacked" },
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
    defineField({
      name: "badge",
      title: "Badge",
      description: "The small tilted pill above the title.",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logos",
      title: "Logos",
      description:
        "Each logo is scaled down to fit its box, never cropped or stretched, so mixed shapes line up. Once they no longer fit the row they scroll on their own, endlessly — nothing to configure for that. Name every outlet in Alternative text: that name is what a screen reader reads out.",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (rule) =>
        rule
          .required()
          .min(2)
          .max(16)
          .custom((logos?: LogoMember[]) =>
            !logos || logos.every(hasAlt)
              ? true
              : "Every logo needs its Alternative text — name the outlet it belongs to.",
          ),
      // deliberately NOT `options: { layout: "grid" }`
      // this makes the alt un-authorable
      // because internationalizedArrayString (array) is rendered as grid cells as well
    }),
  ],
  preview: {
    select: {
      title: "title",
      layout: "layout",
      logos: "logos",
    },
    prepare({
      title,
      layout,
      logos,
    }: {
      title?: LocalizedEntry[];
      layout?: string;
      logos?: unknown[];
    }) {
      const count = logos?.length ?? 0;

      return {
        title: frenchValue(title) ?? "Logos",
        subtitle: `Logos · ${layout ?? "inline"} · ${count} logo${count === 1 ? "" : "s"}`,
      };
    },
  },
});
