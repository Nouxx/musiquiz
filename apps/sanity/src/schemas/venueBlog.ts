import { defineArrayMember, defineField, defineType } from "sanity";
import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { richTextFieldType } from "./shared/richText";

// french only, plain strings on purpose: docs/adr/0013
export const blogFaqType = defineType({
  name: "blogFaq",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "questions",
      type: "array",
      of: [
        defineArrayMember({
          name: "blogFaqQuestion",
          type: "object",
          fields: [
            defineField({
              name: "question",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "answer",
              type: "array",
              of: richTextFieldType.of,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

export const blogFindUsType = defineType({
  name: "blogFindUs",
  title: "Find Us",
  type: "object",
  description:
    "The address, the map and the booking button come from the venue.",
  fieldsets: [
    { name: "address", title: "Adresse", options: { collapsible: false } },
    { name: "hours", title: "Horaires", options: { collapsible: false } },
    { name: "contact", title: "Contact", options: { collapsible: false } },
  ],
  fields: [
    defineField({
      name: "media",
      title: "Background photo",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "badge",
      description: "The small tilted pill above the title.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "addressNote",
      title: "Note",
      description: "The small line under the address.",
      type: "text",
      rows: 2,
      fieldset: "address",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "openingTitle",
      title: "Title",
      type: "string",
      fieldset: "hours",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "openingNote",
      title: "Note",
      type: "text",
      rows: 2,
      fieldset: "hours",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contactTitle",
      title: "Title",
      type: "string",
      fieldset: "contact",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contactNote",
      title: "Note",
      type: "text",
      rows: 2,
      fieldset: "contact",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const venueBlogType = defineType({
  name: "venueBlog",
  title: "Venue blog",
  type: "document",
  icon: BlockContentIcon,
  description: "Closes every blog article about this venue.",
  fields: [
    defineField({
      name: "venue",
      type: "reference",
      to: [{ type: "venue" }],
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "findUs",
      title: "Find Us",
      type: "blogFindUs",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "blogFaq",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { venue: "venue.title" },
    prepare({ venue }: { venue?: string }) {
      return { title: ["Blog", venue].filter(Boolean).join(" · ") };
    },
  },
});
