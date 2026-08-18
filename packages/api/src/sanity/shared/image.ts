import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

export function imageProjection({ lang }: { lang: Lang }) {
  return `{
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "mimeType": asset->mimeType,
    "alt": alt[language == "${lang}"][0].value
  }`;
}

/**
 * For an image an editor may leave empty.
 *
 * Why? Sanity keeps the field object once the field has been touched even if there's no `asset`.
 * this yields an object of null, instead of null, which is what this projection does.
 */
export function optionalImageProjection({
  field,
  lang,
}: {
  field: string;
  lang: Lang;
}) {
  return `select(defined(${field}.asset) => ${field} ${imageProjection({ lang })})`;
}

export const sanityImageSchema = z.strictObject({
  url: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  mimeType: z.string().min(1),
  alt: z.string().min(1).nullable(),
});

export type SanityImage = z.infer<typeof sanityImageSchema>;
