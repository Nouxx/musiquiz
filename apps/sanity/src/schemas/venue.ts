import { defineType } from "sanity";

export const venueType = defineType({
  name: "venue",
  title: "Venues",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
      // todo: add character count
      validation: (rule) => rule.required().max(30),
    },
    {
      name: "slug",
      title: "URL slug",
      type: "slug",
      description: 'How the venue name will appear in a URL. Use the "Generate" button.',
      validation: (rule) => rule.required(),
      hidden: ({ document }) => !document?.title,
      // once the slug is published, it cant be edited anymore
      readOnly: ({ document }) => {
        const id = document?._id
        return !id?.startsWith('drafts.')
      },
      options: {
        source: "title",
      },
    },
  ],
});
