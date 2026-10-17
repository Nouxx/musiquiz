import { defineArrayMember, defineField, defineType } from "sanity";
import { JoystickIcon } from "@sanity/icons/Joystick";
import { currencyOf, type Currency } from "@repo/utils/currency";
import { formatPrice } from "@repo/utils/formatPrice";
import { PriceRowPreview } from "../components/PriceRowPreview";
import { frenchValue, type LocalizedEntry } from "./shared/frenchValue";
import { contentIcons } from "./shared/pageComponents/contentIcons";
import { findDuplicate, takenFormatIds } from "./shared/venueFormatUniqueness";
import { pageGroups } from "./shared/seo";

/** the price card is narrow, these keep each line from wrapping */
const LABEL_MAX_LENGTH = 30;
const CAPTION_MAX_LENGTH = 20;
const NOTE_MAX_LENGTH = 30;

type PriceValue = {
  amount?: number;
};

/** "16€" for one amount or many identical ones, "16€ – 25€" for a range */
function formatSpan(amounts: number[], currency: Currency) {
  const lowest = formatPrice({
    amount: Math.min(...amounts),
    lang: "fr",
    currency,
  });
  const highest = formatPrice({
    amount: Math.max(...amounts),
    lang: "fr",
    currency,
  });

  return lowest === highest ? lowest : `${lowest} – ${highest}`;
}

// the value is an array of one entry per language, so `max` would count
// languages rather than characters
function maxLength(max: number) {
  return function validate(entries?: LocalizedEntry[]) {
    const tooLong = entries?.some((entry) => (entry.value?.length ?? 0) > max);

    return tooLong
      ? `Keep it to ${max} characters — it sits in a narrow card.`
      : true;
  };
}

export const priceType = defineType({
  name: "price",
  title: "Price",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      description: `Who this price is for, in the badge at the top of the card. Example: "De 4 à 6 joueurs", "Tarif unique". ${LABEL_MAX_LENGTH} characters at most.`,
      type: "internationalizedArrayString",
      validation: (rule) => rule.required().custom(maxLength(LABEL_MAX_LENGTH)),
    }),
    defineField({
      name: "icon",
      title: "Label icon",
      type: "string",
      options: { list: contentIcons },
      initialValue: "users-2",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "amount",
      title: "Amount",
      description:
        "In the venue's currency: francs in Switzerland, euros elsewhere.",
      type: "number",
      validation: (rule) => rule.required().min(0).precision(2),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      description: `Beside the amount. Example: "Par personne", "Par groupe". ${CAPTION_MAX_LENGTH} characters at most.`,
      type: "internationalizedArrayString",
      initialValue: [
        {
          _type: "internationalizedArrayStringValue",
          language: "fr",
          value: "Par personne",
        },
        {
          _type: "internationalizedArrayStringValue",
          language: "en",
          value: "Per person",
        },
      ],
      validation: (rule) =>
        rule.required().custom(maxLength(CAPTION_MAX_LENGTH)),
    }),
    defineField({
      name: "note",
      title: "Note",
      description: `A condition attached to this price, shown under the amount. Example: "Si combiné avec Musi'Quiz". ${NOTE_MAX_LENGTH} characters at most.`,
      type: "internationalizedArrayString",
      validation: (rule) => rule.custom(maxLength(NOTE_MAX_LENGTH)),
    }),
  ],
  preview: {
    select: {
      label: "label",
      amount: "amount",
      caption: "caption",
      note: "note",
    },
    // the amount belongs in the subtitle: two rows sharing a label are
    // otherwise the same row twice once collapsed. PriceRowPreview writes it
    prepare({
      label,
      amount,
      caption,
      note,
    }: {
      label?: LocalizedEntry[];
      amount?: number;
      caption?: LocalizedEntry[];
      note?: LocalizedEntry[];
    }) {
      return {
        title: frenchValue(label),
        amount,
        caption: frenchValue(caption),
        note: frenchValue(note),
      };
    },
  },
  components: { preview: PriceRowPreview },
});

export const venueGameType = defineType({
  name: "venueGame",
  title: "Venue Game",
  type: "document",
  icon: JoystickIcon,
  validation: (rule) =>
    rule.custom(async (_value, context) => {
      const duplicate = await findDuplicate({
        documentType: "venueGame",
        field: "game",
        document: context.document,
        getClient: context.getClient,
      });

      if (!duplicate) return true;

      const venue = duplicate.venueTitle ?? "This venue";
      const game = duplicate.formatName ?? "this game";

      return {
        // anchored to the field: a document-level message with no path is difficult to find
        path: ["game"],
        message: `${venue} already has a page for ${game}. Open that page instead — a venue has only one page per game.`,
      };
    }),
  groups: pageGroups,
  fields: [
    defineField({
      name: "venue",
      group: "content",
      title: "Venue",
      type: "reference",
      to: [{ type: "venue" }],
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "game",
      group: "content",
      title: "Game",
      description: "Games this venue already has a page for are not listed.",
      type: "reference",
      to: [{ type: "gameFormat" }],
      validation: (rule) => rule.required(),
      options: {
        filter: async ({ document, getClient }) => {
          const taken = await takenFormatIds({
            documentType: "venueGame",
            field: "game",
            document,
            getClient,
          });
          // with nothing taken this reads `!(_id in [])`, which is every game
          return { filter: "!(_id in $taken)", params: { taken } };
        },
      },
    }),
    defineField({
      name: "prices",
      group: "content",
      title: "Prices",
      description:
        "What this game costs at this venue. Re-order them to decide the order they appear in.",
      type: "array",
      of: [defineArrayMember({ type: "price" })],
      validation: (rule) => rule.required().min(1).max(5),
    }),
    defineField({
      name: "pageCover",
      group: "content",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageComponents",
      group: "content",
      type: "pageComponents",
    }),
    defineField({
      name: "seo",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: {
      gameName: "game.name",
      venueTitle: "venue.title",
      venueCountry: "venue.addressCountry",
      prices: "prices",
    },
    prepare({
      gameName,
      venueTitle,
      venueCountry,
      prices,
    }: {
      gameName?: string;
      venueTitle?: string;
      venueCountry?: string;
      prices?: PriceValue[];
    }) {
      const amounts = (prices ?? [])
        .map((price) => price.amount)
        .filter((amount): amount is number => typeof amount === "number");

      // the span is what an editor scans this list for; the count is already
      // visible from the array itself
      const span =
        amounts.length === 0 || !venueCountry
          ? undefined
          : formatSpan(amounts, currencyOf(venueCountry));

      return {
        title: gameName ?? "No game selected",
        subtitle: [venueTitle, span].filter(Boolean).join(" — "),
      };
    },
  },
});
