import { defineField, defineType } from "sanity";
import { EnvelopeIcon } from "@sanity/icons/Envelope";

export const contactPageType = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "pageCover",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "teamTitle",
      title: "Team section title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "teamIntro",
      title: "Team section intro",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "venuesTitle",
      title: "Venues section title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "venuesIntro",
      title: "Venues section intro",
      type: "internationalizedArrayString",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Contact page" };
    },
  },
});
