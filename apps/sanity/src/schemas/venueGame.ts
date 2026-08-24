import { defineArrayMember, defineField, defineType } from "sanity";
import type {
  Path,
  Reference,
  SanityDocument,
  ValidationContext,
} from "sanity";
import { JoystickIcon } from "@sanity/icons/Joystick";

const API_VERSION = "2025-02-06";

/** the note sits in a narrow card beside the amount, so it has to stay short */
const NOTE_MAX_LENGTH = 30;

/** past this the tier column outgrows the image it stands next to */
const MAX_PRICES = 5;

type GetClient = ValidationContext["getClient"];

type LocalizedEntry = { _key?: string; value?: string };

type PriceValue = {
  _key?: string;
  playerCountFrom?: number;
  playerCountTo?: number;
  amount?: number;
  note?: LocalizedEntry[];
};

function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry._key === "fr")?.value ?? entries?.[0]?.value
  );
}

function venueRefOf(document: SanityDocument | undefined) {
  return (document?.venue as Reference | undefined)?._ref;
}

function gameRefOf(document: SanityDocument | undefined) {
  return (document?.game as Reference | undefined)?._ref;
}

/** the published id, so a draft never counts itself as its own duplicate */
function publishedIdOf(document: SanityDocument | undefined) {
  return (document?._id ?? "").replace(/^drafts\./, "");
}

/**
 * The games this venue already has a page for
 */
async function takenGameIds({
  document,
  getClient,
}: {
  document: SanityDocument | undefined;
  getClient: GetClient;
}) {
  const venueRef = venueRefOf(document);

  if (!venueRef) return [];

  return getClient({ apiVersion: API_VERSION }).fetch<string[]>(
    `*[_type == "venueGame"
      && venue._ref == $venueRef
      && !(_id in [$publishedId, "drafts." + $publishedId])].game._ref`,
    { venueRef, publishedId: publishedIdOf(document) },
  );
}

/**
 * a document drafted before its game was taken still has to be caught
 * and the reference filter only shapes what the search offers.
 */
async function findDuplicate({
  document,
  getClient,
}: {
  document: SanityDocument | undefined;
  getClient: GetClient;
}) {
  const venueRef = venueRefOf(document);
  const gameRef = gameRefOf(document);

  if (!venueRef || !gameRef) return null;

  return getClient({ apiVersion: API_VERSION }).fetch<{
    venueTitle: string | null;
    gameName: string | null;
  } | null>(
    `*[_type == "venueGame"
      && venue._ref == $venueRef
      && game._ref == $gameRef
      && !(_id in [$publishedId, "drafts." + $publishedId])][0]{
      "venueTitle": venue->title,
      "gameName": game->name
    }`,
    { venueRef, gameRef, publishedId: publishedIdOf(document) },
  );
}

/**
 * "16€" for a round amount, "21,50€" otherwise — the same shape the front
 * renders, so a preview never shows a price the page will not
 */
function formatEuros(amount: number) {
  return Number.isSafeInteger(amount)
    ? `${amount}€`
    : `${amount.toFixed(2).replace(".", ",")}€`;
}

/** "16€" for one amount or many identical ones, "16€ – 25€" for a range */
function formatSpan(amounts: number[]) {
  const lowest = Math.min(...amounts);
  const highest = Math.max(...amounts);

  return lowest === highest
    ? formatEuros(lowest)
    : `${formatEuros(lowest)} – ${formatEuros(highest)}`;
}

function pluralPlayers(count: number) {
  return count > 1 ? `${count} joueurs` : `${count} joueur`;
}

/**
 * The badge the front puts on the card, repeated here so a collapsed row reads
 * the way the page will. french only, like every other preview in this studio
 */
function playerRangeLabel({
  playerCountFrom,
  playerCountTo,
}: Pick<PriceValue, "playerCountFrom" | "playerCountTo">) {
  if (playerCountFrom == null) {
    if (playerCountTo == null) return "Tarif unique";

    // rejected by validation: a row in this state is on its way somewhere, and a
    // preview still has to say something about it
    return `Jusqu'à ${pluralPlayers(playerCountTo)}`;
  }

  if (playerCountTo == null) return `${pluralPlayers(playerCountFrom)} et plus`;

  return playerCountTo === playerCountFrom
    ? pluralPlayers(playerCountFrom)
    : `De ${playerCountFrom} à ${pluralPlayers(playerCountTo)}`;
}

function pathToRow(price: PriceValue, field: string): Path | undefined {
  return price._key ? [{ _key: price._key }, field] : undefined;
}

function priceListErrors(prices: PriceValue[] | undefined) {
  if (!prices?.length) return [];

  if (prices.length === 1) {
    const [only] = prices;

    if (only.playerCountFrom == null && only.playerCountTo == null) return [];

    return [
      {
        message:
          "A lone price applies whatever the group size, and the page says so. Clear the player counts, or add a second price.",
        // pinned to whichever count the editor actually filled in
        path: pathToRow(
          only,
          only.playerCountFrom != null ? "playerCountFrom" : "playerCountTo",
        ),
      },
    ];
  }

  return prices
    .filter((price) => price.playerCountFrom == null)
    .map((price) => ({
      message:
        price.playerCountTo == null
          ? "With more than one price, every one of them needs a lower player count."
          : "An upper count needs a lower one beside it — the card reads “De 4 à 6 joueurs”, never “jusqu’à 6”.",
      path: pathToRow(price, "playerCountFrom"),
    }));
}

export const priceType = defineType({
  name: "price",
  title: "Price",
  type: "object",
  fields: [
    defineField({
      name: "playerCountFrom",
      title: "From (players)",
      description:
        "The smallest group this price applies to. Leave empty, along with the upper count, when this is the only price.",
      type: "number",
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: "playerCountTo",
      title: "Up to (players)",
      description:
        'The largest group this price applies to. Leave empty for "and more".',
      type: "number",
      validation: (rule) =>
        rule
          .integer()
          .min(1)
          .custom((value: number | undefined, context) => {
            const from = (context.parent as PriceValue | undefined)
              ?.playerCountFrom;

            if (value == null || from == null) return true;

            return value >= from
              ? true
              : "The upper count cannot be below the lower one.";
          }),
    }),
    defineField({
      name: "amount",
      title: "Amount",
      description: "In euros, per player.",
      type: "number",
      validation: (rule) => rule.required().min(1).precision(2),
    }),
    defineField({
      name: "note",
      title: "Note",
      description: `A condition attached to this price, shown under "Par personne" rather than in place of it. Example: "Si combiné avec Musi'Quiz". ${NOTE_MAX_LENGTH} characters at most.`,
      type: "internationalizedArrayString",
      validation: (rule) =>
        // the value is an array of one entry per language, so `max` would count
        // languages rather than characters
        rule.custom((entries?: LocalizedEntry[]) => {
          const tooLong = entries?.filter(
            (entry) => (entry.value?.length ?? 0) > NOTE_MAX_LENGTH,
          );

          return tooLong?.length
            ? `Keep the note to ${NOTE_MAX_LENGTH} characters — it sits in a narrow card beside the amount.`
            : true;
        }),
    }),
  ],
  preview: {
    select: {
      playerCountFrom: "playerCountFrom",
      playerCountTo: "playerCountTo",
      amount: "amount",
      note: "note",
    },
    prepare({ playerCountFrom, playerCountTo, amount, note }: PriceValue) {
      return {
        title: playerRangeLabel({ playerCountFrom, playerCountTo }),
        // the amount belongs here: two bands sharing a lower count are otherwise
        // the same row twice once collapsed
        subtitle: [
          amount == null ? undefined : formatEuros(amount),
          frenchValue(note),
        ]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});

export const venueGameType = defineType({
  name: "venueGame",
  title: "Venue Game",
  type: "document",
  icon: JoystickIcon,
  validation: (rule) =>
    rule.custom(async (_value, context) => {
      const duplicate = await findDuplicate({
        document: context.document,
        getClient: context.getClient,
      });

      if (!duplicate) return true;

      const venue = duplicate.venueTitle ?? "This venue";
      const game = duplicate.gameName ?? "this game";

      return {
        // anchored to the field: a document-level message with no path is difficult to find
        path: ["game"],
        message: `${venue} already has a page for ${game}. Open that page instead — a venue has only one page per game.`,
      };
    }),
  fields: [
    defineField({
      name: "venue",
      title: "Venue",
      type: "reference",
      to: [{ type: "venue" }],
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "game",
      title: "Game",
      description: "Games this venue already has a page for are not listed.",
      type: "reference",
      to: [{ type: "gameFormat" }],
      validation: (rule) => rule.required(),
      options: {
        filter: async ({ document, getClient }) => {
          const taken = await takenGameIds({ document, getClient });
          // with nothing taken this reads `!(_id in [])`, which is every game
          return { filter: "!(_id in $taken)", params: { taken } };
        },
      },
    }),
    defineField({
      name: "prices",
      title: "Prices",
      description:
        "What this game costs at this venue. Re-order the bands to decide the order they appear in.",
      type: "array",
      of: [defineArrayMember({ type: "price" })],
      validation: (rule) => [
        rule.required().min(1).max(MAX_PRICES),
        // messages are pinned to the row that earned them: one complaint over a
        // list of five leaves the editor guessing which
        rule.custom((prices?: PriceValue[]) => {
          const errors = priceListErrors(prices);

          return errors.length ? errors : true;
        }),
      ],
    }),
    defineField({
      name: "pageCover",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageComponents",
      type: "pageComponents",
    }),
  ],
  preview: {
    select: {
      gameName: "game.name",
      venueTitle: "venue.title",
      prices: "prices",
    },
    prepare({
      gameName,
      venueTitle,
      prices,
    }: {
      gameName?: string;
      venueTitle?: string;
      prices?: PriceValue[];
    }) {
      const amounts = (prices ?? [])
        .map((price) => price.amount)
        .filter((amount): amount is number => typeof amount === "number");

      // the span is what an editor scans this list for; the count is already
      // visible from the array itself
      const span = amounts.length === 0 ? undefined : formatSpan(amounts);

      return {
        title: gameName ?? "No game selected",
        subtitle: [venueTitle, span].filter(Boolean).join(" — "),
      };
    },
  },
});
