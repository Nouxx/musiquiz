import ClockIcon from "@sanity/icons/Clock";
import EnvelopeIcon from "@sanity/icons/Envelope";
import InfoOutlineIcon from "@sanity/icons/InfoOutline";
import PinIcon from "@sanity/icons/Pin";
import { defineArrayMember, defineField, defineType } from "sanity";
import { MapPositionInput } from "../components/MapPositionInput";
import type { StringRule } from "sanity";
import { frenchValue, type LocalizedEntry } from "./shared/frenchValue";
import { ogImageDescription, ogImageWarning } from "./shared/seo";
import TagIcon from "@sanity/icons/Tag";
import { HomeIcon } from "@sanity/icons/Home";
import { BookIcon } from "@sanity/icons/Book";
import { ShareIcon } from "@sanity/icons/Share";

// todo: i18n, "Fermé" is french
function openingTimeValidation(rule: StringRule) {
  return [
    rule.required().error("Opening hours are required"),
    rule
      .regex(/^(Fermé|([01]\d|2[0-3]):[0-5]\d - ([01]\d|2[0-3]):[0-5]\d)$/)
      .error('Must match the format "HH:mm - HH:mm" or "Fermé"'),
  ];
}

const SOCIAL_DESCRIPTION =
  "Only if this venue has its own account. Leave empty to show the Musi'Quiz one.";

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
    { name: "social", title: "Social", icon: ShareIcon },
    { name: "quotation", title: "Quotation", icon: TagIcon },
    { name: "legal", title: "Legal", icon: BookIcon },
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
      name: "hostedByPartner",
      title: "Hosted by a partner venue",
      description:
        "This venue sits inside a partner's premises and the partner's site takes the bookings. Its booking and gift pages are not published.",
      type: "boolean",
      group: "general",
      initialValue: false,
    }),
    defineField({
      name: "partnerBookingUrl",
      title: "Partner booking link",
      description: "Where every “Réserver” of this venue leads.",
      type: "url",
      group: "general",
      hidden: ({ document }) => !document?.hostedByPartner,
      validation: (rule) =>
        rule.custom((value, { document }) =>
          document?.hostedByPartner && !value
            ? "Required for a venue hosted by a partner"
            : true,
        ),
    }),
    defineField({
      name: "partnerGiftingUrl",
      title: "Partner gifting link",
      description:
        "Where “Offrir une partie” leads. Leave empty if the partner sells no vouchers: the link is then hidden.",
      type: "url",
      group: "general",
      hidden: ({ document }) => !document?.hostedByPartner,
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
      name: "ownerMails",
      title: "Owner emails",
      description:
        "List of emails that will receive the internal form responses.",
      type: "array",
      of: [defineArrayMember({ type: "email" })],
      group: "contact",
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "googleMapsLink",
      title: "Google Maps Link",
      type: "string",
      description:
        "The venue's own Google listing, not an address search: open the Musi'Quiz place in Google Maps, then Share. Example: https://maps.app.goo.gl/iiMqAVV75RrJsB4cA",
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
      name: "venueLogoLight",
      title: "Venue Logo, light",
      type: "imageWithAlt",
      description:
        "White version, shown on photos and dark surfaces. Prefer SVG files",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "venueLogoDark",
      title: "Venue Logo, dark",
      type: "imageWithAlt",
      description: "Black version, shown on plain surfaces. Prefer SVG files",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ogImage",
      title: "Sharing image",
      description: ogImageDescription(
        "Used by every page of this venue that has neither a sharing image nor a cover photo of its own. Leave empty to use the one in Site Settings.",
      ),
      type: "image",
      group: "general",
      validation: (rule) => rule.custom(ogImageWarning).warning(),
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
      name: "streetAddress",
      title: "Street address",
      type: "string",
      description: "Example: 28 boulevard Poissonnière",
      group: "location",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "postalCode",
      title: "Postal code",
      type: "string",
      description: "Example: 75009",
      group: "location",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "addressLocality",
      title: "City",
      type: "string",
      description: "As written on an envelope. Example: Paris",
      group: "location",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "addressCountry",
      title: "Country",
      type: "string",
      // ISO 3166-1 alpha-2, what schema.org PostalAddress expects
      options: {
        list: [
          { title: "France", value: "FR" },
          { title: "Belgium", value: "BE" },
          { title: "Switzerland", value: "CH" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "FR",
      group: "location",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook link",
      description: SOCIAL_DESCRIPTION,
      type: "url",
      group: "social",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram link",
      description: SOCIAL_DESCRIPTION,
      type: "url",
      group: "social",
    }),
    defineField({
      name: "tiktokUrl",
      title: "TikTok link",
      description: SOCIAL_DESCRIPTION,
      type: "url",
      group: "social",
    }),
    defineField({
      name: "youtubeUrl",
      title: "Youtube link",
      description: SOCIAL_DESCRIPTION,
      type: "url",
      group: "social",
    }),
    defineField({
      name: "linkedinUrl",
      title: "Linkedin link",
      description: SOCIAL_DESCRIPTION,
      type: "url",
      group: "social",
    }),
    defineField({
      name: "terms",
      title: "Terms and conditions",
      description:
        'The articles of this venue\'s terms, shown on the Terms and conditions page. Numbered in order, so write the title without "Article N".',
      type: "array",
      of: [defineArrayMember({ type: "termsArticle" })],
      group: "legal",
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

export const termsArticleType = defineType({
  name: "termsArticle",
  title: "Article",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: 'Example: "Objet", "Prix des services"',
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      description:
        "Paragraphs, bold and links, nothing else. An empty line between two paragraphs is drawn as a real gap, so break the copy up rather than writing one block.",
      type: "internationalizedArrayRichText",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }: { title?: LocalizedEntry[] }) {
      return { title: frenchValue(title) ?? "Article" };
    },
  },
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
    defineField({
      name: "audiences",
      title: "Applies to",
      description: "The quotation forms this prestation is offered in.",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "grid",
        list: [
          { value: "teamBuilding", title: "Team building" },
          { value: "musiTeens", title: "Musi'Teens" },
        ],
      },
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { label: "label" },
    prepare({ label }: { label?: LocalizedEntry[] }) {
      return { title: frenchValue(label) ?? "Prestation" };
    },
  },
});
