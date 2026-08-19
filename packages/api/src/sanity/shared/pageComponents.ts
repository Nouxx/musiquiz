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

export function pageComponentsProjection({ lang }: { lang: Lang }) {
  return `
    pageComponents[]{
      _type,
      ${rollingBannerProjection({ lang })},
      ${cardsGridProjection({ lang })},
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

// the count is validated in the studio too. mirrored here because it is a
// design constraint, not an editing convenience: below three or above four
// there is no layout to render.
const sanityCardsGridSchema = z.strictObject({
  _type: z.literal("cardsGrid"),
  heading: z.string().min(1),
  body: z.string().min(1),
  align: z.enum(["left", "center"]),
  background: z.enum(["vivid", "muted"]),
  cta: sanityCtaSchema.nullable(),
  cards: z.array(sanityCardSchema).min(3).max(4),
});

export const sanityPageComponentSchema = z.discriminatedUnion("_type", [
  sanityRollingBannerSchema,
  sanityCardsGridSchema,
]);

export type SanityPageComponent = z.infer<typeof sanityPageComponentSchema>;
