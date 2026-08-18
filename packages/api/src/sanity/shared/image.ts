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
 * Sanity keeps the field object once the field has been touched — an
 * `imageWithAlt` holding an `alt` array but no `asset` — so `defined(logo)` is
 * true for an image that was never uploaded, and projecting it straight yields
 * an object of nulls rather than null. Keying off the asset gives the null the
 * nullable schema expects.
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
