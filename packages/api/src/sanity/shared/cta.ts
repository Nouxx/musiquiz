import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

/**
 * For a CTA an editor may leave empty.
 *
 * Why? Sanity keeps the field object once the field has been touched even if there's no `label`.
 * this yields an object of null, instead of null, which is what this projection does.
 */
export function optionalCtaProjection({
  field,
  lang,
}: {
  field: string;
  lang: Lang;
}) {
  return `select(defined(${field}.label) => ${field}{
    "label": label[language == "${lang}"][0].value,
    "url": url[language == "${lang}"][0].value
  })`;
}

export const sanityCtaSchema = z.strictObject({
  label: z.string().min(1),
  url: z.string().min(1),
});

export type SanityCta = z.infer<typeof sanityCtaSchema>;
