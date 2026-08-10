import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

/** Projects a Sanity image field into a CMS Image, with alt text in `lang`. */
export function imageProjection({ lang }: { lang: Lang }) {
  return `{
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "mimeType": asset->mimeType,
    "alt": alt[language == "${lang}"][0].value
  }`;
}

export const sanityImageSchema = z.strictObject({
  url: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  mimeType: z.string().min(1),
  alt: z.string().min(1).nullable(),
});

export type SanityImage = z.infer<typeof sanityImageSchema>;
