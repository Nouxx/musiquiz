import { defineField, defineType } from "sanity";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { pageGroups } from "./shared/seo";

export const contactPageType = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  icon: EnvelopeIcon,
  groups: pageGroups,
  fields: [
    defineField({
      name: "pageCover",
      group: "content",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "teamTitle",
      group: "content",
      title: "Team section title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "teamIntro",
      group: "content",
      title: "Team section intro",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "venuesTitle",
      group: "content",
      title: "Venues section title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "venuesIntro",
      group: "content",
      title: "Venues section intro",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "seo",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Contact page" };
    },
  },
});
