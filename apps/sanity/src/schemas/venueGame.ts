import { defineField, defineType } from "sanity";
import type { Reference, SanityDocument, ValidationContext } from "sanity";
import { JoystickIcon } from "@sanity/icons/Joystick";

const API_VERSION = "2025-02-06";

type GetClient = ValidationContext["getClient"];

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

// one document per (venue, game) pair
// unlike a venue page the id cannot enforce the pair
// because the editor picks the two references that would compose it
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
      name: "price",
      title: "Price",
      description: "In euros, per player.",
      type: "number",
      validation: (rule) => rule.required().min(0),
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
      price: "price",
    },
    prepare({ gameName, venueTitle, price }) {
      return {
        title: gameName ?? "No game selected",
        subtitle: [venueTitle, price == null ? undefined : `${price}€`]
          .filter(Boolean)
          .join(" — "),
      };
    },
  },
});
