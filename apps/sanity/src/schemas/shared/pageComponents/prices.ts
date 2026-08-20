import { defineField, defineType } from "sanity";
import type { Reference, ValidationContext } from "sanity";

const API_VERSION = "2025-02-06";

type GetClient = ValidationContext["getClient"];

type LocalizedEntry = { _key?: string; value?: string };

type PricesParent = {
  venue?: Reference;
};

function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry._key === "fr")?.value ?? entries?.[0]?.value
  );
}

// the reference sits in an object inside an array, so the venue it depends on is
// on `parent` — the prices object — not on `document`, which is the page holding it
function venueRefOf(parent: unknown) {
  return (parent as PricesParent | undefined)?.venue?._ref;
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

export const pricesType = defineType({
  name: "prices",
  title: "Prices",
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
      description: "Which venue these prices are for.",
      type: "reference",
      to: [{ type: "venue" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "game",
      title: "Game",
      description:
        "Narrow to a single game. Only games this venue runs are listed. Leave empty for every game at the venue.",
      type: "reference",
      to: [{ type: "gameFormat" }],
      // an unfiltered list before a venue is picked would offer games the venue may not run
      hidden: ({ parent }) => !venueRefOf(parent),
      options: {
        filter: async ({ parent, getClient }) => {
          const games = await gameIdsAtVenue({ parent, getClient });
          // with no venueGame at the venue this reads `_id in []`, which is nothing
          return { filter: "_id in $games", params: { games } };
        },
      },
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
      const scope = [venueTitle, gameName].filter(Boolean).join(" — ");

      return {
        title: frenchValue(title) ?? "Prices",
        subtitle: ["Prices", scope].filter(Boolean).join(" · "),
      };
    },
  },
});
