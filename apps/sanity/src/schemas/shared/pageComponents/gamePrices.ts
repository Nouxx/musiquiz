import { defineField, defineType } from "sanity";
import type { Reference, ValidationContext } from "sanity";

const API_VERSION = "2025-02-06";

type GetClient = ValidationContext["getClient"];

type LocalizedEntry = { _key?: string; value?: string };

type GamePricesParent = {
  venue?: Reference;
};

function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry._key === "fr")?.value ?? entries?.[0]?.value
  );
}

// the reference sits in an object inside an array, so the venue it depends on is
// on `parent` — the gamePrices object — not on `document`, which is the page holding it
function venueRefOf(parent: unknown) {
  return (parent as GamePricesParent | undefined)?.venue?._ref;
}

/**
 * The games this venue actually runs, as venueGame is the (venue, game) pairing
 */
async function gameIdsAtVenue({
  parent,
  getClient,
}: {
  parent: unknown;
  getClient: GetClient;
}) {
  const venueRef = venueRefOf(parent);

  if (!venueRef) return [];

  return getClient({ apiVersion: API_VERSION }).fetch<string[]>(
    `*[_type == "venueGame" && venue._ref == $venueRef].game._ref`,
    { venueRef },
  );
}

export const gamePricesType = defineType({
  name: "gamePrices",
  title: "Game Prices",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "surface",
      title: "Background",
      type: "string",
      initialValue: "muted",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Muted", value: "muted" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "venue",
      title: "Venue",
      description: "Pick the venue before the game.",
      type: "reference",
      to: [{ type: "venue" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "game",
      title: "Game",
      description: "Only games this venue runs are listed.",
      type: "reference",
      to: [{ type: "gameFormat" }],
      // readOnly rather than hidden: the field is required, and a required field
      // an editor cannot see reports an error that points at nothing
      readOnly: ({ parent }) => !venueRefOf(parent),
      validation: (rule) => rule.required(),
      options: {
        filter: async ({ parent, getClient }) => {
          const games = await gameIdsAtVenue({ parent, getClient });
          // with no venue picked this reads `_id in []`, which is nothing
          return { filter: "_id in $games", params: { games } };
        },
      },
    }),
    defineField({
      name: "footnote",
      title: "Footnote",
      description:
        "An optional panel under the buttons, for something worth reassuring a visitor about. Fill both fields or neither.",
      type: "pricesFootnote",
    }),
    defineField({
      name: "cta",
      title: "Call to action",
      description:
        "An optional button beside the booking one, for an offer worth pointing at. Leave it empty and only the booking button shows.",
      type: "cta",
    }),
  ],
  preview: {
    select: {
      title: "title",
      venueTitle: "venue.title",
      gameName: "game.name",
    },
    prepare({
      title,
      venueTitle,
      gameName,
    }: {
      title?: LocalizedEntry[];
      venueTitle?: string;
      gameName?: string;
    }) {
      const pair = [venueTitle, gameName].filter(Boolean).join(" — ");

      return {
        title: frenchValue(title) ?? "Game Prices",
        subtitle: ["Game Prices", pair].filter(Boolean).join(" · "),
      };
    },
  },
});
