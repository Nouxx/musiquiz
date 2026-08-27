import { defineField, defineType } from "sanity";

const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;

export const videoEmbedType = defineType({
  name: "videoEmbed",
  title: "Video Embed",
  type: "object",
  fields: [
    defineField({
      name: "videoId",
      title: "Video ID",
      description:
        "Open the video on YouTube and copy what follows ?v= in the address bar: in https://www.youtube.com/watch?v=aqz-KE-bpKQ that is aqz-KE-bpKQ, 11 characters. A youtu.be share link does not carry it — open the video on youtube.com first.",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value?: string) =>
            !value || videoIdPattern.test(value)
              ? true
              : "A YouTube video ID is exactly 11 letters, digits, - or _",
          ),
    }),
    defineField({
      name: "title",
      title: "Title",
      description:
        "Never shown on the page — YouTube draws its own title inside the player. This one names the video for screen readers, so write what the video shows.",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "surface",
      title: "Background",
      description: "The band the player sits on.",
      type: "string",
      initialValue: "vivid",
      options: {
        list: [
          { title: "Vivid", value: "vivid" },
          { title: "Muted", value: "muted" },
          { title: "White", value: "default" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      videoId: "videoId",
    },
    prepare({ videoId }: { videoId?: string }) {
      return {
        title: "Video Embed",
        subtitle: videoId,
      };
    },
  },
});
