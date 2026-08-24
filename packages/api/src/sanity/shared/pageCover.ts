import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

import {
  imageProjection,
  optionalImageProjection,
  sanityImageSchema,
} from "./image";

export function pageCoverProjection({ lang }: { lang: Lang }) {
  return `{
        media ${imageProjection({ lang })},
        "logo": ${optionalImageProjection({ field: "logo", lang })},
        "heading": heading[language == "${lang}"][0].value,
        "subHeading": subHeading[language == "${lang}"][0].value,
        "badge": badge[language == "${lang}"][0].value,
        "ctaLabel": ctaLabel[language == "${lang}"][0].value,
    }`;
}

export const sanityPageCoverSchema = z.strictObject({
  media: sanityImageSchema,
  logo: sanityImageSchema.nullable(),
  heading: z.string().min(1),
  subHeading: z.string().min(1).nullable(),
  badge: z.string().min(1).nullable(),
  ctaLabel: z.string().min(1),
});

export type SanityPageCover = z.infer<typeof sanityPageCoverSchema>;
