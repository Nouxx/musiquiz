import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

import { optionalCtaProjection, sanityCtaSchema } from "./cta";
import { imageProjection, sanityImageSchema } from "./image";

function rollingBannerProjection({ lang }: { lang: Lang }) {
  return `
    _type == "rollingBanner" => {
      "message": message[language == "${lang}"][0].value,
      "color": coalesce(color, "red")
    }
  `;
}

function reviewsProjection() {
  return `
    _type == "reviews" => {
      "venueSlug": venue->slug.current,
      starsThreshold,
      "surface": coalesce(surface, "default"),
      searchTerm
    }
  `;
}

function venuePricesProjection({ lang }: { lang: Lang }) {
  // the games are resolved from venueGame, the (venue, game) pairing, rather than
  // authored: the section lists every game the venue runs. `^` reaches back out of
  // the subquery to the venuePrices object holding the reference. drafts are handled
  // by the client perspective, so the subquery does not filter them.
  // `game->name` is a plain string, not internationalized, so `lang` never reaches it
  return `
    _type == "venuePrices" => {
      "title": title[language == "${lang}"][0].value,
      "surface": coalesce(surface, "muted"),
      "games": *[
        _type == "venueGame"
        && venue._ref == ^.venue._ref
      ] | order(game->displayOrder asc) {
        "name": game->name
      }
    }
  `;
}

function gamePricesProjection({ lang }: { lang: Lang }) {
  // venueGame holds one document per (venue, game), so the pair resolves to exactly
  // one game or to nothing at all — the latter only if the venueGame was deleted
  // after this section was authored, which is a broken reference rather than a
  // legitimate state, and the schema below refuses it
  return `
    _type == "gamePrices" => {
      "title": title[language == "${lang}"][0].value,
      "surface": coalesce(surface, "muted"),
      "game": *[
        _type == "venueGame"
        && venue._ref == ^.venue._ref
        && game._ref == ^.game._ref
      ][0] {
        "name": game->name
      }
    }
  `;
}

function cardsGridProjection({ lang }: { lang: Lang }) {
  return `
    _type == "cardsGrid" => {
      "heading": heading[language == "${lang}"][0].value,
      "body": body[language == "${lang}"][0].value,
      align,
      background,
      "cta": ${optionalCtaProjection({ field: "cta", lang })},
      cards[]{
        media ${imageProjection({ lang })},
        "badge": badge[language == "${lang}"][0].value,
        "title": title[language == "${lang}"][0].value,
        "body": body[language == "${lang}"][0].value,
        "cta": ${optionalCtaProjection({ field: "cta", lang })}
      }
    }
  `;
}

function carouselProjection({ lang }: { lang: Lang }) {
  return `
    _type == "carousel" => {
      "badge": badge[language == "${lang}"][0].value,
      "title": title[language == "${lang}"][0].value,
      "body": body[language == "${lang}"][0].value,
      "cta": ${optionalCtaProjection({ field: "cta", lang })},
      "ctaTone": coalesce(ctaTone, "red"),
      "images": images[] ${imageProjection({ lang })}
    }
  `;
}

export function pageComponentsProjection({ lang }: { lang: Lang }) {
  return `
    pageComponents[]{
      _type,
      ${rollingBannerProjection({ lang })},
      ${cardsGridProjection({ lang })},
      ${carouselProjection({ lang })},
      ${reviewsProjection()},
      ${venuePricesProjection({ lang })},
      ${gamePricesProjection({ lang })},
    }
  `;
}

const sanityRollingBannerSchema = z.strictObject({
  _type: z.literal("rollingBanner"),
  message: z.string().min(1),
  color: z.enum(["red", "blue"]),
});

const sanityCardSchema = z.strictObject({
  media: sanityImageSchema,
  badge: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1).nullable(),
  cta: sanityCtaSchema.nullable(),
});

export type SanityCard = z.infer<typeof sanityCardSchema>;

const sanityCardsGridSchema = z.strictObject({
  _type: z.literal("cardsGrid"),
  heading: z.string().min(1),
  body: z.string().min(1),
  align: z.enum(["left", "center"]),
  background: z.enum(["vivid", "muted"]),
  cta: sanityCtaSchema.nullable(),
  cards: z.array(sanityCardSchema).min(3).max(4),
});

const sanityCarouselSchema = z.strictObject({
  _type: z.literal("carousel"),
  badge: z.string().min(1).nullable(),
  title: z.string().min(1),
  body: z.string().min(1),
  cta: sanityCtaSchema.nullable(),
  ctaTone: z.enum(["red", "blue"]),
  images: z.array(sanityImageSchema).min(5).max(12),
});

const sanityReviewsSchema = z.strictObject({
  _type: z.literal("reviews"),
  venueSlug: z.string().min(1).nullable(),
  starsThreshold: z.union([z.literal(4), z.literal(5)]),
  surface: z.enum(["default", "muted"]),
  searchTerm: z.string().min(1).nullable(),
});

const sanityVenuePricesSchema = z.strictObject({
  _type: z.literal("venuePrices"),
  title: z.string().min(1),
  surface: z.enum(["default", "muted"]),
  // empty is legitimate: a venue may run no games yet
  games: z.array(z.strictObject({ name: z.string().min(1) })),
});

const sanityGamePricesSchema = z.strictObject({
  _type: z.literal("gamePrices"),
  title: z.string().min(1),
  surface: z.enum(["default", "muted"]),
  // not nullable: a section pointing at a deleted venueGame has nothing to render
  // and no other game to fall back on, so it fails the build rather than rendering
  // a heading over nothing
  game: z.strictObject({ name: z.string().min(1) }),
});

export const sanityPageComponentSchema = z.discriminatedUnion("_type", [
  sanityRollingBannerSchema,
  sanityCardsGridSchema,
  sanityCarouselSchema,
  sanityReviewsSchema,
  sanityVenuePricesSchema,
  sanityGamePricesSchema,
]);

export type SanityPageComponent = z.infer<typeof sanityPageComponentSchema>;
