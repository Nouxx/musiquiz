import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";

// french only, plain strings on purpose: docs/adr/0013
export const blogArticleType = defineType({
  name: "blogArticle",
  title: "Blog article",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      description:
        'How the article will appear in a URL. Use the "Generate" button.',
      options: { source: "title" },
      validation: (rule) => rule.required(),
      hidden: ({ document }) => !document?.title,
    }),
    defineField({
      name: "publishedAt",
      title: "Publication date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "venue",
      type: "reference",
      to: [{ type: "venue" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      description: "Shown on the article card, in the blog listing.",
      validation: (rule) => rule.required().max(200),
    }),
  ],
  orderings: [
    {
      title: "Publication date, newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      venue: "venue.title",
      publishedAt: "publishedAt",
      media: "cover",
    },
    prepare({ title, venue, publishedAt, media }) {
      return {
        title,
        subtitle: [venue, publishedAt].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
