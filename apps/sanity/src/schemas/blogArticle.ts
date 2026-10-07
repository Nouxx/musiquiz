import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { contentIcons } from "./shared/pageComponents/contentIcons";
import { richTextFieldType } from "./shared/richText";
import { pageGroups } from "./shared/seo";

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
      description: "Between 3 and 8.",
      validation: (rule) => rule.required().min(3).max(8),
    }),
  ],
});

// french only, plain strings on purpose: docs/adr/0013
export const blogArticleType = defineType({
  name: "blogArticle",
  title: "Blog article",
  type: "document",
  icon: DocumentTextIcon,
  groups: pageGroups,
  fields: [
    defineField({
      name: "title",
      group: "content",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      group: "content",
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
      group: "content",
      title: "Publication date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      group: "content",
      title: "Update date",
      description:
        'Set it after a real rewrite, not a typo fix. The article then reads "Mis à jour le".',
      type: "date",
    }),
    defineField({
      name: "venue",
      group: "content",
      type: "reference",
      to: [{ type: "venue" }],
      description:
        'Optional. Pick one when the article is about a single venue. Readers are then sent to that venue: the booking buttons open its booking page, the article ends with its address and map, the breadcrumb and the article card show its name, and "À lire aussi" suggests other articles about the same venue. The venue also needs its own entry under Blog → Venues, or the site build fails. When set, it wins over Event.',
    }),
    defineField({
      name: "event",
      group: "content",
      type: "reference",
      to: [{ type: "eventFormat" }],
      description:
        'Optional. Pick one when the article is about an occasion rather than a place, like a bachelor party or team building. Used only when Venue is empty: the button then leads to the event\'s page, the breadcrumb and the article card show the event\'s name, "À lire aussi" suggests other articles about the same event, and there is no address or map. With neither a venue nor an event, the button leads to the "Où nous trouver" page and "À lire aussi" shows the latest articles.',
    }),
    defineField({
      name: "author",
      group: "content",
      type: "reference",
      to: [{ type: "teamMember" }],
      description: "The team member must have a short bio.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cover",
      group: "content",
      title: "Cover image",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      group: "content",
      type: "text",
      rows: 3,
      description: "Shown on the article card, in the blog listing.",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "summary",
      group: "content",
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
      group: "content",
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
      group: "content",
      title: "Number of reviews",
      description:
        'Adds a "5/5 sur N avis" pill after the key facts. Leave empty for none.',
      type: "number",
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({
      name: "body",
      group: "content",
      title: "Article",
      type: "articleBody",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faq",
      group: "content",
      title: "FAQ",
      description:
        "Optional. The questions this article answers, also sent to search engines as FAQ data. Leave empty when the article raises none.",
      type: "blogFaq",
    }),
    defineField({
      name: "seo",
      type: "blogSeo",
      group: "seo",
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
      event: "event.name",
      publishedAt: "publishedAt",
      media: "cover",
    },
    prepare({ title, venue, event, publishedAt, media }) {
      return {
        title,
        subtitle: [venue ?? event, publishedAt].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
