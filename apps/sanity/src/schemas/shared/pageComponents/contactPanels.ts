import { defineField, defineType, type PreviewValue } from "sanity";
import { frenchValue, type LocalizedEntry } from "../frenchValue";

// the internationalized-array plugin filters on `language`, not on `_key`
function seed({
  fr,
  en,
  type = "String",
}: {
  fr: string;
  en: string;
  type?: "String" | "Text";
}) {
  const _type = `internationalizedArray${type}Value`;

  return [
    { _key: "fr", _type, language: "fr", value: fr },
    { _key: "en", _type, language: "en", value: en },
  ];
}

export const contactPanelsType = defineType({
  name: "contactPanels",
  title: "Contact Panels",
  type: "object",
  fieldsets: [
    { name: "quote", title: "Devis", options: { collapsible: false } },
    { name: "booking", title: "Réservation", options: { collapsible: false } },
  ],
  fields: [
    defineField({
      name: "media",
      title: "Background photo",
      description:
        "Sits behind the whole section, under a dark wash. Pick something that reads at full width with text over it.",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "venue",
      title: "Venue",
      description:
        "Supplies the phone number and email shown on the right, and where the booking button leads.",
      type: "reference",
      to: [{ type: "venue" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "quoteLabel",
      title: "Label",
      type: "internationalizedArrayString",
      fieldset: "quote",
      initialValue: seed({
        fr: "Plus d'informations",
        en: "More information",
      }),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "quoteTitle",
      title: "Title",
      type: "internationalizedArrayString",
      fieldset: "quote",
      initialValue: seed({ fr: "Demander un devis", en: "Request a quote" }),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "quoteBody",
      title: "Body",
      type: "internationalizedArrayText",
      fieldset: "quote",
      initialValue: seed({
        fr: "Remplissez le formulaire ci-dessous et vous recevrez un devis adapté à vos besoins dans les plus brefs délais.",
        en: "Fill in the form below and you'll receive a quote tailored to your needs as soon as possible.",
        type: "Text",
      }),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "quoteCta",
      title: "Call to action",
      description:
        "Optional. The booking button beside it is always there, and leads to this venue's booking page.",
      type: "cta",
      fieldset: "quote",
    }),
    defineField({
      name: "bookingLabel",
      title: "Label",
      type: "internationalizedArrayString",
      fieldset: "booking",
      initialValue: seed({ fr: "Réservation", en: "Booking" }),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bookingTitle",
      title: "Title",
      type: "internationalizedArrayString",
      fieldset: "booking",
      initialValue: seed({
        fr: "Réservation immédiate jusqu'à 18 joueurs",
        en: "Instant booking for up to 18 players",
      }),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bookingBody",
      title: "Body",
      type: "internationalizedArrayText",
      fieldset: "booking",
      initialValue: seed({
        fr: "Choisissez l'option Team Building lors de votre réservation. Si besoin de restauration, privilégiez la demande de devis.",
        en: "Choose the Team Building option when you book. If you need catering, request a quote instead.",
        type: "Text",
      }),
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "quoteTitle",
      venueTitle: "venue.title",
      media: "media",
    },
    prepare({
      title,
      venueTitle,
      media,
    }: {
      title?: LocalizedEntry[];
      venueTitle?: string;
      media?: PreviewValue["media"];
    }) {
      return {
        title: frenchValue(title) ?? "Contact Panels",
        subtitle: ["Contact Panels", venueTitle].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
