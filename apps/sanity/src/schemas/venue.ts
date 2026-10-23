import ClockIcon from "@sanity/icons/Clock";
import EnvelopeIcon from "@sanity/icons/Envelope";
import InfoOutlineIcon from "@sanity/icons/InfoOutline";
import PinIcon from "@sanity/icons/Pin";
import { defineArrayMember, defineField, defineType } from "sanity";
import { BrevoListIdField } from "../components/BrevoListIdField";
import { MapPositionInput } from "../components/MapPositionInput";
import type { SlugValue, StringRule, UrlRule } from "sanity";
import {
  frenchValue,
  type LocalizedEntry,
  requiredInEveryLanguage,
} from "./shared/localized";
import { ogImageDescription, ogImageWarning } from "./shared/seo";
import TagIcon from "@sanity/icons/Tag";
import { HomeIcon } from "@sanity/icons/Home";
import { BookIcon } from "@sanity/icons/Book";
import { ShareIcon } from "@sanity/icons/Share";
import { CalendarIcon } from "@sanity/icons/Calendar";
import { TrendUpwardIcon } from "@sanity/icons/TrendUpward";
import { UsersIcon } from "@sanity/icons/Users";
import { gtmIdValidation } from "./shared/gtmId";
import { llmsDescriptionField } from "./shared/llmsDescription";
import {
  isVenueSlug,
  slugifyVenueTitle,
  VENUE_SLUG_MAX_LENGTH,
} from "@repo/utils/venueSlug";

// todo: i18n, "Fermé" is french
function openingTimeValidation(rule: StringRule) {
  return [
    rule.required().error("Opening hours are required"),
    rule
      .regex(/^(Fermé|([01]\d|2[0-3]):[0-5]\d - ([01]\d|2[0-3]):[0-5]\d)$/)
      .error('Must match the format "HH:mm - HH:mm" or "Fermé"'),
  ];
}

const WIDGET_ID_DESCRIPTION =
  "The `data-widget-id` of this venue's catalog widget in the 4escape back office.";

type ProviderField = "bookingProvider" | "giftingProvider";

function widgetIdValidation(rule: StringRule, providerField: ProviderField) {
  return [
    rule.custom((value, { document }) =>
      document?.[providerField] === "4escape" && !value
        ? "Required when 4escape is the provider"
        : true,
    ),
    rule
      .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      .error("Must be a widget ID, like fa25b722-264c-4644-b65e-5e8aeb60f7b3"),
  ];
}

function externalUrlValidation(rule: UrlRule, providerField: ProviderField) {
  // the url type validates the format already, a second rule.uri() repeats its error
  return rule.custom((value, { document }) => {
    if (document?.[providerField] === "external" && !value) {
      return "Required when an external site is the provider";
    }
    if (value && !value.startsWith("https")) return "Must use https";
    return true;
  });
}

function venueSlugRule(value?: SlugValue) {
  const slug = value?.current;

  if (!slug || isVenueSlug(slug)) return true;
  return `Lowercase letters, digits and single hyphens, starting with a letter, at most ${VENUE_SLUG_MAX_LENGTH} characters. Use the "Generate" button.`;
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
    { name: "booking", title: "Booking", icon: CalendarIcon },
    { name: "contact", title: "Contact", icon: EnvelopeIcon },
    { name: "newsletter", title: "Newsletter", icon: UsersIcon },
    { name: "location", title: "Location", icon: PinIcon },
    { name: "openHours", title: "Open Hours", icon: ClockIcon },
    { name: "social", title: "Social", icon: ShareIcon },
    { name: "quotation", title: "Quotation", icon: TagIcon },
    { name: "legal", title: "Legal", icon: BookIcon },
    { name: "tracking", title: "Tracking", icon: TrendUpwardIcon },
  ],
  fieldsets: [
    { name: "booking", title: "Booking" },
    { name: "gifting", title: "Gifting" },
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
      validation: (rule) => [rule.required(), rule.custom(venueSlugRule)],
      hidden: ({ document }) => !document?.title,
      // once the slug is published, it cant be edited anymore
      readOnly: ({ document }) => {
        const id = document?._id;
        return !id?.startsWith("drafts.");
      },
      options: {
        source: "title",
        slugify: slugifyVenueTitle,
      },
    }),
    llmsDescriptionField({
      subject: "this venue",
      hint: "Say where the games are played, e.g. in a partner venue.",
      fallback: "the venue home page's meta description",
      group: "general",
    }),
    defineField({
      name: "forEscapeSettings",
      title: "4escape settings",
      description:
        "The `data-settings` value from this venue's 4escape embed snippet, starting with `b64.`",
      type: "string",
      group: "booking",
      hidden: ({ document }) =>
        document?.bookingProvider !== "4escape" &&
        document?.giftingProvider !== "4escape",
      validation: (rule) =>
        rule.custom((value, { document }) =>
          (document?.bookingProvider === "4escape" ||
            document?.giftingProvider === "4escape") &&
          !value
            ? "Required when 4escape is a provider"
            : true,
        ),
    }),
    defineField({
      name: "bookingProvider",
      title: "Booking provider",
      description:
        "Who takes this venue's bookings. External: every “Réserver” leads to that site and the booking page is not published.",
      type: "string",
      group: "booking",
      fieldset: "booking",
      options: {
        list: [
          { title: "4escape", value: "4escape" },
          { title: "External site", value: "external" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "4escape",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bookingWidgetId",
      title: "Booking widget ID",
      description: WIDGET_ID_DESCRIPTION,
      type: "string",
      group: "booking",
      fieldset: "booking",
      hidden: ({ document }) => document?.bookingProvider !== "4escape",
      validation: (rule) => widgetIdValidation(rule, "bookingProvider"),
    }),
    defineField({
      name: "externalBookingUrl",
      title: "External booking link",
      description: "Where every “Réserver” of this venue leads.",
      type: "url",
      group: "booking",
      fieldset: "booking",
      hidden: ({ document }) => document?.bookingProvider !== "external",
      validation: (rule) => externalUrlValidation(rule, "bookingProvider"),
    }),
    defineField({
      name: "giftingProvider",
      title: "Gifting provider",
      description:
        "Who sells this venue's vouchers. External or none: the gift page is not published, and with none “Offrir une partie” is hidden.",
      type: "string",
      group: "booking",
      fieldset: "gifting",
      options: {
        list: [
          { title: "4escape", value: "4escape" },
          { title: "External site", value: "external" },
          { title: "None", value: "none" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "4escape",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "giftingWidgetId",
      title: "Gifting widget ID",
      description: WIDGET_ID_DESCRIPTION,
      type: "string",
      group: "booking",
      fieldset: "gifting",
      hidden: ({ document }) => document?.giftingProvider !== "4escape",
      validation: (rule) => widgetIdValidation(rule, "giftingProvider"),
    }),
    defineField({
      name: "externalGiftingUrl",
      title: "External gifting link",
      description: "Where “Offrir une partie” leads.",
      type: "url",
      group: "booking",
      fieldset: "gifting",
      hidden: ({ document }) => document?.giftingProvider !== "external",
      validation: (rule) => externalUrlValidation(rule, "giftingProvider"),
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
      name: "newsletterProvider",
      title: "Newsletter provider",
      description:
        "Where the footer newsletter sign-ups go. Mail to owners: each sign-up is mailed to the owner emails, to be added by hand.",
      type: "string",
      group: "newsletter",
      options: {
        list: [
          { title: "Brevo", value: "brevo" },
          { title: "Mail to owners (Zoho)", value: "zeptomail" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "zeptomail",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "brevoListId",
      title: "Brevo list ID",
      description:
        "The ID of the list sign-ups join, in this venue's Brevo account under Contacts → Lists.",
      type: "number",
      group: "newsletter",
      components: { field: BrevoListIdField },
      hidden: ({ document }) => document?.newsletterProvider !== "brevo",
      validation: (rule) => [
        rule.custom((value, { document }) =>
          document?.newsletterProvider === "brevo" && value === undefined
            ? "Required when Brevo is the provider"
            : true,
        ),
        rule.integer().positive(),
      ],
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
      name: "googlePlaceId",
      title: "Google Place ID",
      type: "string",
      description:
        "Where the rating and review count shown on blog articles come from. Search the venue in Google's Place ID Finder (https://developers.google.com/maps/documentation/places/web-service/place-id) and copy the ID. Example: ChIJ-4dw_QPVwkcRZ2wlWBaW-0k",
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
        'The articles of this venue\'s terms, shown on the Terms and conditions page. Numbered in order, so write the title without "Article N". Leave empty when the venue has no terms of its own: it is left off the page.',
      type: "array",
      of: [defineArrayMember({ type: "termsArticle" })],
      group: "legal",
    }),
    defineField({
      name: "gtmId",
      title: "Google Tag Manager ID",
      description:
        "The container of the agency tracking this venue. Loaded on this venue's pages only, next to the global one. Leave empty when the venue is not tracked. Example: GTM-XXXXXX",
      type: "string",
      group: "tracking",
      validation: gtmIdValidation,
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
      validation: (rule) => rule.custom(requiredInEveryLanguage()),
    }),
    defineField({
      name: "body",
      title: "Body",
      description:
        "Paragraphs, text styles and links, nothing else. An empty line between two paragraphs is drawn as a real gap, so break the copy up rather than writing one block. Shift+Enter breaks the line without starting a paragraph.",
      type: "internationalizedArrayRichText",
      validation: (rule) => rule.custom(requiredInEveryLanguage()),
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
      validation: (rule) => rule.custom(requiredInEveryLanguage()),
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
