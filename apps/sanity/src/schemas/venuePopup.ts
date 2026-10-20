import { defineField, defineType } from "sanity";
import { BellIcon } from "@sanity/icons/Bell";
import { isCtaFilled } from "./shared/cta";
import {
  maxLengthInEveryLanguage,
  requiredInEveryLanguage,
} from "./shared/localized";

const TITLE_MAX_LENGTH = 40;
const TEXT_MAX_LENGTH = 120;

type PopupDocument = { enabled?: boolean };

function isEnabled(document?: unknown) {
  return (document as PopupDocument | undefined)?.enabled === true;
}

// the pop-up shows on /en pages too, and an empty one fails the build
const requiredWhileOn = requiredInEveryLanguage(
  ({ document }) => isEnabled(document),
  "Required while the pop-up is on",
);

export const venuePopupType = defineType({
  name: "venuePopup",
  title: "Venue pop-up",
  type: "document",
  icon: BellIcon,
  description:
    "A card in the bottom-right corner of every page of this venue, except the booking and gift pages.",
  fields: [
    defineField({
      name: "venue",
      type: "reference",
      to: [{ type: "venue" }],
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "enabled",
      title: "Show the pop-up",
      description:
        "Takes effect on the next deploy. While it is off, the fields below may stay half-filled.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "background",
      type: "string",
      options: {
        list: [
          { title: "Glass", value: "glass" },
          { title: "Vivid", value: "vivid" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "glass",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      description: `${TITLE_MAX_LENGTH} characters at most.`,
      type: "internationalizedArrayString",
      validation: (rule) =>
        rule
          .custom(requiredWhileOn)
          .custom(maxLengthInEveryLanguage(TITLE_MAX_LENGTH)),
    }),
    defineField({
      name: "text",
      description: `${TEXT_MAX_LENGTH} characters at most.`,
      type: "internationalizedArrayText",
      validation: (rule) =>
        rule
          .custom(requiredWhileOn)
          .custom(maxLengthInEveryLanguage(TEXT_MAX_LENGTH)),
    }),
    defineField({
      name: "cta",
      title: "Button",
      type: "cta",
      validation: (rule) =>
        rule.custom((value, { document }) =>
          isEnabled(document) && !isCtaFilled(value)
            ? "Required while the pop-up is on"
            : true,
        ),
    }),
    defineField({
      name: "logo",
      description: "Beside the text. Hidden on phones.",
      type: "imageWithAlt",
    }),
  ],
  preview: {
    select: { venue: "venue.title", enabled: "enabled" },
    prepare({ venue, enabled }: { venue?: string; enabled?: boolean }) {
      return {
        title: ["Pop-up", venue].filter(Boolean).join(" · "),
        subtitle: enabled ? "On" : "Off",
      };
    },
  },
});
