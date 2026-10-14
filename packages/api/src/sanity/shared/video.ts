import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

import { optionalImageProjection, sanityImageSchema } from "./image";

export function videoProjection({ lang }: { lang: Lang }) {
  return `{
    "assetId": file.asset._ref,
    "url": file.asset->url,
    "poster": ${optionalImageProjection({ field: "poster", lang })},
  }`;
}

export const sanityVideoSchema = z.strictObject({
  assetId: z.string(),
  url: z.url(),
  poster: sanityImageSchema.nullable(),
});

export type SanityVideo = z.infer<typeof sanityVideoSchema>;
