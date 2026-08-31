import ClockIcon from "@sanity/icons/Clock";
import EnvelopeIcon from "@sanity/icons/Envelope";
import InfoOutlineIcon from "@sanity/icons/InfoOutline";
import PinIcon from "@sanity/icons/Pin";
import { defineArrayMember, defineField, defineType } from "sanity";
import { MapPositionInput } from "../components/MapPositionInput";
import type { StringRule } from "sanity";
import { frenchValue, type LocalizedEntry } from "./shared/frenchValue";
import TagIcon from "@sanity/icons/Tag";
import { HomeIcon } from "@sanity/icons/Home";

// todo: i18n, "Fermé" is french
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
  icon: HomeIcon,
  groups: [
    {
      name: "general",
      title: "General",
      icon: InfoOutlineIcon,
      default: true,
    },
    { name: "contact", title: "Contact", icon: EnvelopeIcon },
    { name: "location", title: "Location", icon: PinIcon },
    { name: "openHours", title: "Open Hours", icon: ClockIcon },
    { name: "quotation", title: "Quotation", icon: TagIcon },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "general",
      // todo: add character count
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      group: "general",
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
      group: "location",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "geopoint",
      description:
        "Where the map in the Find Us section is centred. Right-click the venue in Google Maps and copy the coordinates it offers. Leave Altitude empty — it is not used.",
      group: "location",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mapPosition",
      title: "Position on the map",
      description:
        "Where the venue's dot sits on the homepage map. Click or drag on the map. The other venues are shown faded.",
      type: "object",
      group: "location",
      components: { input: MapPositionInput },
      fields: [
        defineField({
          name: "x",
          title: "X",
          type: "number",
          validation: (rule) => rule.required().min(0).max(100),
        }),
        defineField({
          name: "y",
          title: "Y",
          type: "number",
          validation: (rule) => rule.required().min(0).max(100),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "regionCode",
      title: "Region code",
      type: "string",
      description: "Example: '59' for Lille",
      group: "location",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "venueLogo",
      title: "Venue Logo",
      type: "imageWithAlt",
      description: "Prefer SVG files",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "quotationServices",
      title: "Prestations",
      description:
        "What a visitor can tick in the quotation form. Ordered as authored.",
      type: "array",
      of: [defineArrayMember({ type: "quotationService" })],
      group: "quotation",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "addressLine",
      title: "Address line",
      type: "string",
      description: "Example: 28 boulevard Poissonnière, 75009 Paris",
      group: "location",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const quotationServiceType = defineType({
  name: "quotationService",
  title: "Prestation",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { label: "label" },
    prepare({ label }: { label?: LocalizedEntry[] }) {
      return { title: frenchValue(label) ?? "Prestation" };
    },
  },
});
