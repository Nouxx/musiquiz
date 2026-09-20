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

function parentOf(parent: unknown) {
  return parent as PageCoverParent | undefined;
}

function hasAuthorableCta(document: unknown) {
  const { _type, pageType } = (document as PageCoverDocument | undefined) ?? {};

  if (_type === "legalNoticePage" || _type === "termsAndConditionsPage") {
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
        "A photo behind the text, or one of the two gradients on its own.",
      type: "string",
      initialValue: "image",
      validation: (rule) => rule.required(),
      options: {
        list: [
          { title: "Image", value: "image" },
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
      name: "aside",
      title: "Beside the text",
      description:
        "The right-hand side of the cover: nothing, the game's logo, or two columns of photos drifting past each other.",
      type: "string",
      initialValue: "none",
      validation: (rule) => rule.required(),
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Logo", value: "logo" },
          { title: "Photo columns", value: "columns" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "logo",
      title: "Logo",
      description:
        "The game's own mark, shown beside the text. Not the venue logo, which the header already carries.",
      type: "imageWithAlt",
      hidden: ({ parent }) => parentOf(parent)?.aside !== "logo",
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
