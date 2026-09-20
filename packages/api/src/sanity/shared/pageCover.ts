import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

import { optionalCtaProjection, sanityCtaSchema } from "./cta";
import {
  imageProjection,
  optionalImageProjection,
  sanityImageSchema,
} from "./image";

export function pageCoverProjection({ lang }: { lang: Lang }) {
  return `{
        "background": coalesce(background, "image"),
        "media": ${optionalImageProjection({ field: "media", lang })},
        "aside": coalesce(aside, "none"),
        "logo": ${optionalImageProjection({ field: "logo", lang })},
        "images": images[] ${imageProjection({ lang })},
        "heading": heading[language == "${lang}"][0].value,
        "subHeading": subHeading[language == "${lang}"][0].value,
        "badge": badge[language == "${lang}"][0].value,
        "cta": ${optionalCtaProjection({ field: "cta", lang })},
        "secondaryCta": ${optionalCtaProjection({ field: "secondaryCta", lang })},
    }`;
}

const basePageCoverSchema = z.strictObject({
  background: z.enum(["image", "brand", "vivid"]),
  media: sanityImageSchema.nullable(),
  aside: z.enum(["none", "logo", "columns"]),
  logo: sanityImageSchema.nullable(),
  images: z.array(sanityImageSchema).min(6).max(12).nullable(),
  heading: z.string().min(1),
  subHeading: z.string().min(1).nullable(),
  badge: z.string().min(1).nullable(),
  cta: sanityCtaSchema.nullable(),
  secondaryCta: sanityCtaSchema.nullable(),
});

export function sanityPageCoverSchema({ hasCta }: { hasCta: boolean }) {
  return hasCta
    ? basePageCoverSchema.extend({ cta: sanityCtaSchema })
    : basePageCoverSchema;
}

export type SanityPageCover = z.infer<typeof basePageCoverSchema>;
