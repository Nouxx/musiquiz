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

function pricedGameProjection({ lang }: { lang: Lang }) {
  return `{
    "name": game->name,
    "image": game->image ${imageProjection({ lang })},
    prices[]{
      playerCountFrom,
      playerCountTo,
      amount,
      "note": note[language == "${lang}"][0].value
    }
  }`;
}

function venuePricesProjection({ lang }: { lang: Lang }) {
  return `
    _type == "venuePrices" => {
      "title": title[language == "${lang}"][0].value,
      "surface": coalesce(surface, "muted"),
      "cta": ${optionalCtaProjection({ field: "cta", lang })},
      "venueSlug": venue->slug.current,
      "games": *[
        _type == "venueGame"
        && venue._ref == ^.venue._ref
      ] | order(game->displayOrder asc) ${pricedGameProjection({ lang })}
    }
  `;
}

function gamePricesProjection({ lang }: { lang: Lang }) {
  // venueGame holds one document per (venue, game), so the pair resolves to exactly one game or to nothing at all
  return `
    _type == "gamePrices" => {
      "title": title[language == "${lang}"][0].value,
      "surface": coalesce(surface, "muted"),
      "game": *[
        _type == "venueGame"
        && venue._ref == ^.venue._ref
        && game._ref == ^.game._ref
      ][0] ${pricedGameProjection({ lang })}
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

const sanityPriceSchema = z.strictObject({
  playerCountFrom: z.number().int().positive().nullable(),
  playerCountTo: z.number().int().positive().nullable(),
  amount: z.number().positive(),
  note: z.string().min(1).nullable(),
});

const sanityPricedGameSchema = z.strictObject({
  name: z.string().min(1),
  image: sanityImageSchema,
  prices: z.array(sanityPriceSchema).min(1),
});

export type SanityPricedGame = z.infer<typeof sanityPricedGameSchema>;

const sanityVenuePricesSchema = z.strictObject({
  _type: z.literal("venuePrices"),
  title: z.string().min(1),
  surface: z.enum(["default", "muted"]),
  cta: sanityCtaSchema.nullable(),
  venueSlug: z.string().min(1),
  games: z.array(sanityPricedGameSchema),
});

const sanityGamePricesSchema = z.strictObject({
  _type: z.literal("gamePrices"),
  title: z.string().min(1),
  surface: z.enum(["default", "muted"]),
  // not nullable: a section pointing at a deleted venueGame has nothing to render
  // and no other game to fall back on, so it fails the build rather than rendering a heading over nothing
  game: sanityPricedGameSchema,
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
