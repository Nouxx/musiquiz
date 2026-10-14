import { SANITY_API_VERSION } from "@repo/utils/sanityConfig";
import { defineArrayMember, defineField, defineType } from "sanity";

import { hasWidget } from "../venuePage";

type PageCoverParent = {
  background?: string;
  aside?: string;
};

type PageCoverDocument = {
  _type?: string;
  pageType?: string;
};

// the homepage cover is centered with the logo on top; nothing else fits that layout
function isHomepage(document: unknown) {
  return (document as PageCoverDocument | undefined)?._type === "homepage";
}

// 8MB
const MAX_VIDEO_BYTES = 8 * 1024 * 1024;

function parentOf(parent: unknown) {
  return parent as PageCoverParent | undefined;
}

// todo: maybe think about moving this logic to the call site?
function hasAuthorableCta(document: unknown) {
  const { _type, pageType } = (document as PageCoverDocument | undefined) ?? {};

  if (
    _type === "homepage" ||
    _type === "legalNoticePage" ||
    _type === "termsAndConditionsPage" ||
    _type === "whereToFindUsPage" ||
    _type === "globalBookingPage" ||
    _type === "joinTheNetworkPage" ||
    _type === "contactPage" ||
    _type === "globalGame" ||
    _type === "globalEvent"
  ) {
    return false;
  }

  // The booking and gifting covers take their buttons from the build: the url is the anchor of the widget those pages render
  return !hasWidget(pageType);
}

export const pageCoverType = defineType({
  name: "pageCover",
  title: "Page Cover",
  type: "object",
  fields: [
    defineField({
      name: "background",
      title: "Background",
      description:
        "A photo or a looping video behind the text, or one of the two gradients on its own.",
      type: "string",
      initialValue: "image",
      validation: (rule) => rule.required(),
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
          { title: "Brand gradient", value: "brand" },
          { title: "Vivid gradient", value: "vivid" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "media",
      title: "Media",
      type: "imageWithAlt",
      hidden: ({ parent }) => parentOf(parent)?.background !== "image",
      validation: (rule) =>
        rule.custom((value, context) =>
          parentOf(context.parent)?.background === "image" && !value
            ? "Required for an image background"
            : true,
        ),
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "object",
      hidden: ({ parent }) => parentOf(parent)?.background !== "video",
      validation: (rule) =>
        rule.custom((value, context) =>
          parentOf(context.parent)?.background === "video" && !value
            ? "Required for a video background"
            : true,
        ),
      fields: [
        defineField({
          name: "file",
          title: "Video file",
          description:
            "Plays muted and on a loop, without controls. Export as MP4 (H.264), at most 1080p and 15 seconds, under 8 MB.",
          type: "file",
          options: { accept: "video/mp4,video/webm" },
          validation: (rule) =>
            rule.required().custom(async (value, context) => {
              const ref = value?.asset?._ref;

              if (!ref) {
                return true;
              }

              const size = await context
                .getClient({ apiVersion: SANITY_API_VERSION })
                .fetch<number | null>(`*[_id == $ref][0].size`, { ref });

              return size && size > MAX_VIDEO_BYTES
                ? `${(size / 1024 / 1024).toFixed(1)} MB. Keep it under 8 MB.`
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
      ],
    }),
    defineField({
      name: "aside",
      title: "Beside the text",
      description:
        "The right-hand side of the cover: nothing, the game's logo, or two columns of photos drifting past each other.",
      type: "string",
      initialValue: "none",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Logo", value: "logo" },
          { title: "Photo columns", value: "columns" },
        ],
        layout: "radio",
      },
      hidden: ({ document }) => isHomepage(document),
      validation: (rule) =>
        rule
          .required()
          .custom((value, context) =>
            isHomepage(context.document) && value !== "logo"
              ? "The homepage cover always shows the logo"
              : true,
          ),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      description:
        "The game's own mark, shown beside the text. Not the venue logo, which the header already carries.",
      type: "imageWithAlt",
      hidden: ({ parent }) => parentOf(parent)?.aside !== "logo",
      validation: (rule) =>
        rule.custom((value, context) =>
          parentOf(context.parent)?.aside === "logo" && !value
            ? "Required for a logo aside"
            : true,
        ),
    }),
    defineField({
      name: "images",
      title: "Images",
      description:
        "Between 6 and 12, shown beside the text on a big screen only, in two columns drifting past each other. Each one is cropped hard to a tall portrait from its centre, so pick photos whose subject sits in the middle.",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      hidden: ({ parent }) => parentOf(parent)?.aside !== "columns",
      validation: (rule) =>
        rule
          .min(6)
          .max(12)
          .custom((value, context) =>
            parentOf(context.parent)?.aside === "columns" && !value
              ? "Required for photo columns"
              : true,
          ),
      // deliberately NOT `options: { layout: "grid" }`
      // this makes the alt un-authorable
      // because internationalizedArrayString (array) is rendered as grid cells as well
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subHeading",
      title: "Sub heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "cta",
      title: "Call to action",
      description: "The button under the text.",
      type: "cta",
      hidden: ({ document }) => !hasAuthorableCta(document),
      validation: (rule) =>
        rule.custom((value, context) =>
          hasAuthorableCta(context.document) && !value ? "Required" : true,
        ),
    }),
    defineField({
      name: "secondaryCta",
      title: "Second call to action",
      description: "The light button beside the first one.",
      type: "cta",
      hidden: ({ document }) => !hasAuthorableCta(document),
    }),
  ],
});
