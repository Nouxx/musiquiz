import ClockIcon from "@sanity/icons/Clock";
import EnvelopeIcon from "@sanity/icons/Envelope";
import ImageIcon from "@sanity/icons/Image";
import JoystickIcon from "@sanity/icons/Joystick";
import { defineField, defineType } from "sanity";
import type { Path, Reference, StringRule } from "sanity";

type Offering = {
  _key: string;
  game?: Reference;
  price?: number;
};

function openingTimeValidation(rule: StringRule) {
  return [
    rule.required().error("Opening hours are required"),
    rule
      .regex(/^(Fermé|([01]\d|2[0-3]):[0-5]\d - ([01]\d|2[0-3]):[0-5]\d)$/)
      .error('Must match the format "HH:mm - HH:mm" or "Fermé"'),
  ];
}

export const venueType = defineType({
  name: "venue",
  title: "Venues",
  type: "document",
  groups: [
    { name: "pageCover", title: "Page Cover", icon: ImageIcon },
    { name: "contact", title: "Contact", icon: EnvelopeIcon },
    { name: "openHours", title: "Open Hours", icon: ClockIcon },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      // todo: add character count
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      description:
        'How the venue name will appear in a URL. Use the "Generate" button.',
      validation: (rule) => rule.required(),
      hidden: ({ document }) => !document?.title,
      // once the slug is published, it cant be edited anymore
      readOnly: ({ document }) => {
        const id = document?._id;
        return !id?.startsWith("drafts.");
      },
      options: {
        source: "title",
      },
    }),
    defineField({
      name: "offerings",
      title: "Offerings",
      type: "array",
      validation: (rule) =>
        rule.custom((offerings?: Offering[]) => {
          if (!offerings) return true;

          const seen = new Map<string, number>();
          const duplicatePaths: Path[] = [];

          offerings.forEach((offering, index) => {
            const ref = offering?.game?._ref;
            if (!ref) return;

            if (seen.has(ref)) {
              duplicatePaths.push([{ _key: offering._key }, "game"]);
            } else {
              seen.set(ref, index);
            }
          });

          if (duplicatePaths.length === 0) return true;

          return {
            message: "This game has already been selected for this venue",
            paths: duplicatePaths,
          };
        }),
      of: [
        defineField({
          name: "offering",
          title: "Offering",
          type: "object",
          icon: JoystickIcon,
          fields: [
            defineField({
              name: "game",
              title: "Game",
              type: "reference",
              to: [{ type: "gameFormat" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "price",
              title: "Price",
              type: "number",
              validation: (rule) => rule.required().min(0),
            }),
          ],
          preview: {
            select: {
              title: "game.name",
              subtitle: "price",
            },
            prepare({ title, subtitle }) {
              return {
                title: title ?? "No game selected",
                subtitle: subtitle != null ? `${subtitle}€` : "No price",
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "pageCoverMedia",
      title: "Page Cover Media",
      type: "imageWithAlt",
      group: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageCoverHeading",
      title: "Page Cover Heading",
      type: "internationalizedArrayString",
      group: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageCoverSubHeading",
      title: "Page Cover Sub Heading",
      type: "internationalizedArrayString",
      group: "pageCover",
    }),
    defineField({
      name: "pageCoverBadge",
      title: "Page Cover Badge",
      type: "internationalizedArrayString",
      group: "pageCover",
    }),
    defineField({
      name: "pageCoverCtaLabel",
      title: "Page Cover CTA Label",
      type: "internationalizedArrayString",
      group: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mondayOpeningHours",
      title: "Monday opening hours",
      description: 'Opening hours on Mondays. Example: "09:30 - 20:00"',
      type: "string",
      group: "openHours",
      validation: (rule) => openingTimeValidation(rule),
    }),
    defineField({
      name: "tuesdayOpeningHours",
      title: "Tuesday opening hours",
      description: 'Opening hours on Tuesdays. Example: "09:30 - 20:00"',
      type: "string",
      group: "openHours",
      validation: (rule) => openingTimeValidation(rule),
    }),
    defineField({
      name: "wednesdayOpeningHours",
      title: "Wednesday opening hours",
      description: 'Opening hours on Wednesdays. Example: "09:30 - 20:00"',
      type: "string",
      group: "openHours",
      validation: (rule) => openingTimeValidation(rule),
    }),
    defineField({
      name: "thursdayOpeningHours",
      title: "Thursday opening hours",
      description: 'Opening hours on Thursdays. Example: "09:30 - 20:00"',
      type: "string",
      group: "openHours",
      validation: (rule) => openingTimeValidation(rule),
    }),
    defineField({
      name: "fridayOpeningHours",
      title: "Friday opening hours",
      description: 'Opening hours on Fridays. Example: "09:30 - 20:00"',
      type: "string",
      group: "openHours",
      validation: (rule) => openingTimeValidation(rule),
    }),
    defineField({
      name: "saturdayOpeningHours",
      title: "Saturday opening hours",
      description: 'Opening hours on Saturdays. Example: "09:30 - 20:00"',
      type: "string",
      group: "openHours",
      validation: (rule) => openingTimeValidation(rule),
    }),
    defineField({
      name: "sundayOpeningHours",
      title: "Sunday opening hours",
      description: 'Opening hours on Sundays. Example: "09:30 - 20:00"',
      type: "string",
      group: "openHours",
      validation: (rule) => openingTimeValidation(rule),
    }),
    defineField({
      name: "phone",
      title: "Phone number",
      type: "string",
      validation: (rule) => rule.required(), // todo: phone validation
      group: "contact",
    }),
    defineField({
      name: "mail",
      title: "Email",
      type: "email",
      validation: (rule) => rule.required(),
      group: "contact",
    }),
    defineField({
      name: "googleMapsLink",
      title: "Google Maps Link",
      type: "string",
      description:
        "Paste it from Google Maps, example: https://share.google/pfpYwPnyAXvmLJ1Su",
      group: "contact",
    }),
  ],
});
