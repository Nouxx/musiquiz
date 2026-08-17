import { defineField, defineType } from "sanity";

export const pageCoverType = defineType({
  name: "pageCover",
  title: "Page Cover",
  type: "object",
  fields: [
    defineField({
      name: "media",
      title: "Media",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subHeading",
      title: "Sub heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA label",
      description:
        "The text on the button. Where it leads is decided by the page it sits on.",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(), // todo: not working, to check
    }),
    // there is no CTA url: driven by the front
  ],
});
