import { SANITY_API_VERSION } from "@repo/utils/sanityConfig";
import { defineField, defineType } from "sanity";

const MAX_VIDEO_BYTES = 15 * 1024 * 1024;

export const videoFields = [
  defineField({
    name: "file",
    title: "Video file",
    description:
      "Plays muted and on a loop, without controls. MP4 only: convert any other format first. Under 15 MB. Only the first 15 seconds play on the site: a longer video is cut, so trim it yourself to choose which part plays.",
    type: "file",
    options: { accept: "video/mp4" },
    validation: (rule) =>
      rule.required().custom(async (value, context) => {
        const ref = value?.asset?._ref;

        if (!ref) {
          return true;
        }

        const asset = await context
          .getClient({ apiVersion: SANITY_API_VERSION })
          .fetch<{
            size: number;
            mimeType: string;
          } | null>(`*[_id == $ref][0]{ size, mimeType }`, { ref });

        if (!asset) {
          return true;
        }

        // `accept` only filters the file picker, a dropped file skips it
        if (asset.mimeType !== "video/mp4") {
          return "MP4 only. Convert the video to MP4 (H.264) first.";
        }

        return asset.size > MAX_VIDEO_BYTES
          ? `${(asset.size / 1024 / 1024).toFixed(1)} MB. Keep it under 15 MB.`
          : true;
      }),
  }),
  defineField({
    name: "poster",
    title: "Poster",
    description:
      "Shown while the video loads, and instead of it for visitors who turn motion off. Use a frame of the video.",
    type: "image",
    validation: (rule) => rule.required(),
  }),
];

export const videoType = defineType({
  name: "video",
  title: "Video",
  type: "object",
  fields: videoFields,
  preview: {
    select: { media: "poster" },
    prepare({ media }) {
      return { title: "Video", media };
    },
  },
});
