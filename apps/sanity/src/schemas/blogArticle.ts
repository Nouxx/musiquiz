import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { contentIcons } from "./shared/pageComponents/contentIcons";

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
      name: "updatedAt",
      title: "Update date",
      description:
        'Set it after a real rewrite, not a typo fix. The article then reads "Mis à jour le".',
      type: "date",
    }),
    defineField({
      name: "venue",
      type: "reference",
      to: [{ type: "venue" }],
      description:
        "The venue also needs its own entry under Blog → Venues, or the site build fails.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "teamMember" }],
      description: "The team member must have a short bio.",
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
    defineField({
      name: "summary",
      title: "Summary",
      description: 'The "Le résumé en 30 secondes" box, above the article.',
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Paragraph", value: "normal" }],
          lists: [],
          marks: {
            decorators: [{ title: "Bold", value: "strong" }],
            annotations: [],
          },
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "chips",
      title: "Key facts",
      description: 'The pills under the summary. Example: "75 min de jeu".',
      type: "array",
      of: [
        defineArrayMember({
          name: "chip",
          type: "object",
          fields: [
            defineField({
              name: "icon",
              type: "string",
              options: { list: contentIcons },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "icon" } },
        }),
      ],
    }),
    defineField({
      name: "reviewCount",
      title: "Number of reviews",
      description:
        'Adds a "5/5 sur N avis" pill after the key facts. Leave empty for none.',
      type: "number",
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({
      name: "body",
      title: "Article",
      type: "articleBody",
      validation: (rule) => rule.required(),
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
