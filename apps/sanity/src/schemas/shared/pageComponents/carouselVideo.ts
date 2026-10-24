import { defineField, defineType } from "sanity";
import { videoFields } from "../video";

export const carouselVideoType = defineType({
  name: "carouselVideo",
  title: "Video",
  type: "object",
  fields: [
    ...videoFields,
    defineField({
      name: "link",
      title: "Link",
      description:
        "Optional. An Instagram, TikTok or YouTube post. When set, the whole slide opens it in a new tab.",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
  ],
  preview: {
    select: { media: "poster", link: "link" },
    prepare({ media, link }: { media?: unknown; link?: string }) {
      return {
        title: "Video",
        subtitle: link ? URL.parse(link)?.hostname : undefined,
        media,
      };
    },
  },
});
