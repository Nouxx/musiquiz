import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

import { optionalCtaProjection, sanityCtaSchema } from "./cta";
import { imageProjection, sanityImageSchema } from "./image";
import { richTextProjection, sanityRichTextSchema } from "./richText";
import { sanityTextBlockSchema, textBlockProjection } from "./textBlock";

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

function footnoteProjection({ lang }: { lang: Lang }) {
  return `"footnote": select(
    defined(footnote.title[language == "${lang}"][0].value)
    && defined(footnote.body[language == "${lang}"][0].value)
    => footnote{
      "title": title[language == "${lang}"][0].value,
      "body": body[language == "${lang}"][0].value
    }
  )`;
}

function venuePricesProjection({ lang }: { lang: Lang }) {
  return `
    _type == "venuePrices" => {
      "title": title[language == "${lang}"][0].value,
      "surface": coalesce(surface, "muted"),
      "cta": ${optionalCtaProjection({ field: "cta", lang })},
      ${footnoteProjection({ lang })},
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
      "cta": ${optionalCtaProjection({ field: "cta", lang })},
      ${footnoteProjection({ lang })},
      "venueSlug": venue->slug.current,
      "game": *[
        _type == "venueGame"
        && venue._ref == ^.venue._ref
        && game._ref == ^.game._ref
      ][0] ${pricedGameProjection({ lang })}
    }
  `;
}

function findUsProjection({ lang }: { lang: Lang }) {
  return `
    _type == "findUs" => {
      "badge": badge[language == "${lang}"][0].value,
      "title": title[language == "${lang}"][0].value,
      "media": media ${imageProjection({ lang })},
      "venueTitle": venue->title,
      "location": venue->location{ lat, lng },
      "address": venue->addressLine,
      "mapsUrl": venue->googleMapsLink,
      "addressNote": addressNote[language == "${lang}"][0].value,
      "openingTitle": openingTitle[language == "${lang}"][0].value,
      "openingNote": openingNote[language == "${lang}"][0].value,
      "contactTitle": contactTitle[language == "${lang}"][0].value,
      "contactNote": contactNote[language == "${lang}"][0].value
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

function clientContactFormProjection({ lang }: { lang: Lang }) {
  return `
    _type == "clientContactForm" => {
      "images": images[] ${imageProjection({ lang })}
    }
  `;
}

function logosProjection({ lang }: { lang: Lang }) {
  return `
    _type == "logos" => {
      "layout": coalesce(layout, "inline"),
      "surface": coalesce(surface, "default"),
      "badge": badge[language == "${lang}"][0].value,
      "title": title[language == "${lang}"][0].value,
      "logos": logos[] ${imageProjection({ lang })}
    }
  `;
}

function faqProjection({ lang }: { lang: Lang }) {
  return `
    _type == "faq" => {
      "title": title[language == "${lang}"][0].value,
      questions[]{
        "question": question[language == "${lang}"][0].value,
        "answer": ${richTextProjection({ field: "answer", lang })}
      },
      "images": images[] ${imageProjection({ lang })}
    }
  `;
}

function cardsScrollerProjection({ lang }: { lang: Lang }) {
  return `
    _type == "cardsScroller" => {
      "textBlock": ${textBlockProjection({ field: "textBlock", lang })},
      cards[]{
        "media": media ${imageProjection({ lang })},
        "title": title[language == "${lang}"][0].value,
        "body": ${richTextProjection({ field: "body", lang })}
      }
    }
  `;
}

function detailTabsProjection({ lang }: { lang: Lang }) {
  return `
    _type == "detailTabs" => {
      "title": title[language == "${lang}"][0].value,
      groups[]{
        "name": name[language == "${lang}"][0].value,
        cards[]{
          mark,
          "title": title[language == "${lang}"][0].value,
          "intro": intro[language == "${lang}"][0].value,
          "highlight": highlight[language == "${lang}"][0].value
        }
      },
      "images": images[] ${imageProjection({ lang })}
    }
  `;
}

function textSlideshowProjection({ lang }: { lang: Lang }) {
  return `
    _type == "textSlideshow" => {
      "textBlock": ${textBlockProjection({ field: "textBlock", lang })},
      "surface": coalesce(surface, "default"),
      "slideshowPosition": coalesce(slideshowPosition, "right"),
      "images": images[] ${imageProjection({ lang })}
    }
  `;
}

function textCardsProjection({ lang }: { lang: Lang }) {
  return `
    _type == "textCards" => {
      "textBlock": ${textBlockProjection({ field: "textBlock", lang })},
      cards[]{
        icon,
        "body": body[language == "${lang}"][0].value,
        media ${imageProjection({ lang })}
      }
    }
  `;
}

function videoEmbedProjection({ lang }: { lang: Lang }) {
  return `
    _type == "videoEmbed" => {
      videoId,
      "title": title[language == "${lang}"][0].value,
      "surface": coalesce(surface, "vivid")
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
      ${findUsProjection({ lang })},
      ${clientContactFormProjection({ lang })},
      ${logosProjection({ lang })},
      ${faqProjection({ lang })},
      ${cardsScrollerProjection({ lang })},
      ${detailTabsProjection({ lang })},
      ${textSlideshowProjection({ lang })},
      ${textCardsProjection({ lang })},
      ${videoEmbedProjection({ lang })},
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
  title: z.string().nullable(),
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

const sanityPricesFootnoteSchema = z.strictObject({
  title: z.string().min(1),
  body: z.string().min(1),
});

const sanityVenuePricesSchema = z.strictObject({
  _type: z.literal("venuePrices"),
  title: z.string().min(1),
  surface: z.enum(["default", "muted"]),
  cta: sanityCtaSchema.nullable(),
  footnote: sanityPricesFootnoteSchema.nullable(),
  venueSlug: z.string().min(1),
  games: z.array(sanityPricedGameSchema),
});

const sanityGamePricesSchema = z.strictObject({
  _type: z.literal("gamePrices"),
  title: z.string().min(1),
  surface: z.enum(["default", "muted"]),
  cta: sanityCtaSchema.nullable(),
  footnote: sanityPricesFootnoteSchema.nullable(),
  venueSlug: z.string().min(1),
  // not nullable: a section pointing at a deleted venueGame has nothing to render
  // and no other game to fall back on, so it fails the build rather than rendering a heading over nothing
  game: sanityPricedGameSchema,
});

const sanityFindUsSchema = z.strictObject({
  _type: z.literal("findUs"),
  badge: z.string().min(1),
  title: z.string().min(1),
  media: sanityImageSchema,
  venueTitle: z.string().min(1),
  location: z.strictObject({ lat: z.number(), lng: z.number() }),
  address: z.string().min(1),
  mapsUrl: z.string().min(1),
  addressNote: z.string().min(1),
  openingTitle: z.string().min(1),
  openingNote: z.string().min(1),
  contactTitle: z.string().min(1),
  contactNote: z.string().min(1),
});

const sanityClientContactFormSchema = z.strictObject({
  _type: z.literal("clientContactForm"),
  images: z.array(sanityImageSchema).min(1).max(8),
});

const sanityLogosSchema = z.strictObject({
  _type: z.literal("logos"),
  layout: z.enum(["inline", "stacked"]),
  surface: z.enum(["default", "muted"]),
  badge: z.string().min(1),
  title: z.string().min(1),
  logos: z.array(sanityImageSchema).min(2).max(16),
});

const sanityFaqQuestionSchema = z.strictObject({
  question: z.string().min(1),
  answer: sanityRichTextSchema,
});

export type SanityFaqQuestion = z.infer<typeof sanityFaqQuestionSchema>;

const sanityFaqSchema = z.strictObject({
  _type: z.literal("faq"),
  title: z.string().min(1),
  questions: z.array(sanityFaqQuestionSchema).min(3).max(8),
  images: z.array(sanityImageSchema).min(6).max(12),
});

const sanityDeckCardSchema = z.strictObject({
  media: sanityImageSchema,
  title: z.string().min(1),
  body: sanityRichTextSchema,
});

export type SanityDeckCard = z.infer<typeof sanityDeckCardSchema>;

const sanityCardsScrollerSchema = z.strictObject({
  _type: z.literal("cardsScroller"),
  textBlock: sanityTextBlockSchema,
  cards: z.array(sanityDeckCardSchema).min(2).max(6),
});

const sanityDetailCardSchema = z.strictObject({
  mark: z.enum(["50-50", "mute", "theft", "x2"]).nullable(),
  title: z.string().min(1),
  intro: z.string().min(1).nullable(),
  highlight: z.string().min(1),
});

const sanityDetailGroupSchema = z.strictObject({
  name: z.string().min(1),
  cards: z.array(sanityDetailCardSchema).min(2).max(6),
});

export type SanityDetailGroup = z.infer<typeof sanityDetailGroupSchema>;

const sanityDetailTabsSchema = z.strictObject({
  _type: z.literal("detailTabs"),
  title: z.string().min(1),
  groups: z.array(sanityDetailGroupSchema).min(1).max(4),
  images: z.array(sanityImageSchema).min(6).max(12),
});

const sanityTextSlideshowSchema = z.strictObject({
  _type: z.literal("textSlideshow"),
  textBlock: sanityTextBlockSchema,
  surface: z.enum(["default", "muted"]),
  slideshowPosition: z.enum(["left", "right"]),
  images: z.array(sanityImageSchema).min(1).max(8),
});

const sanityContentIconSchema = z.enum([
  "calendar",
  "camera",
  "check-circle",
  "clock",
  "cocktail",
  "coins",
  "cube",
  "die-1",
  "die-2",
  "disc",
  "hourglass",
  "house",
  "lock",
  "mail",
  "medal",
  "music-note",
  "phone",
  "pin",
  "question",
  "rosette",
  "sparkles",
  "star",
  "user",
  "users-2",
  "users-3",
  "users-4",
]);

const sanityTextCardSchema = z.strictObject({
  icon: sanityContentIconSchema,
  body: z.string().min(1),
  media: sanityImageSchema,
});

export type SanityTextCard = z.infer<typeof sanityTextCardSchema>;

const sanityTextCardsSchema = z.strictObject({
  _type: z.literal("textCards"),
  textBlock: sanityTextBlockSchema,
  cards: z.array(sanityTextCardSchema).min(3).max(4),
});

const sanityVideoEmbedSchema = z.strictObject({
  _type: z.literal("videoEmbed"),
  videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  title: z.string().min(1),
  surface: z.enum(["default", "muted", "vivid"]),
});

export const sanityPageComponentSchema = z.discriminatedUnion("_type", [
  sanityRollingBannerSchema,
  sanityCardsGridSchema,
  sanityCarouselSchema,
  sanityReviewsSchema,
  sanityVenuePricesSchema,
  sanityGamePricesSchema,
  sanityFindUsSchema,
  sanityClientContactFormSchema,
  sanityLogosSchema,
  sanityFaqSchema,
  sanityCardsScrollerSchema,
  sanityDetailTabsSchema,
  sanityTextSlideshowSchema,
  sanityTextCardsSchema,
  sanityVideoEmbedSchema,
]);

export type SanityPageComponent = z.infer<typeof sanityPageComponentSchema>;
