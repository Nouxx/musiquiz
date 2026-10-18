import { defineField, defineType } from "sanity";
import { BellIcon } from "@sanity/icons/Bell";
import type { LocalizedEntry } from "./shared/frenchValue";

const LANGUAGES = ["fr", "en"];

type PopupDocument = { enabled?: boolean };

function isEnabled(document?: unknown) {
  return (document as PopupDocument | undefined)?.enabled === true;
}

// every language: the pop-up shows on /en pages too, and an empty one fails the build
function requiredInEveryLanguage(
  entries: LocalizedEntry[] | undefined,
  { document }: { document?: unknown },
) {
  if (!isEnabled(document)) return true;

  const missing = LANGUAGES.filter(
    (language) =>
      !entries?.some((entry) => entry.language === language && entry.value),
  );

  return missing.length
    ? `Required while the pop-up is on. Missing: ${missing.join(", ")}`
    : true;
}

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
      type: "internationalizedArrayString",
      validation: (rule) => rule.custom(requiredInEveryLanguage),
    }),
    defineField({
      name: "text",
      type: "internationalizedArrayText",
      validation: (rule) => rule.custom(requiredInEveryLanguage),
    }),
    defineField({
      name: "cta",
      title: "Button",
      type: "cta",
      validation: (rule) =>
        rule.custom((value, { document }) =>
          isEnabled(document) && !value
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
