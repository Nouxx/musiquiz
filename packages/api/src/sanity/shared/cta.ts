import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

/**
 * For a cta an editor may leave empty.
 *
 * Why? Two ways a cta can be there without being usable, and `defined(cta)`
 * catches neither: sanity keeps the object once the field has been touched, and
 * the internationalized array keeps an entry per language whether or not it was
 * filled. So the guard is the value this language actually resolves to, both
 * halves of it — a button with no label, or a label with nowhere to go, is not
 * a button.
 */
export function optionalCtaProjection({
  field,
  lang,
}: {
  field: string;
  lang: Lang;
}) {
  return `select(
    defined(${field}.label[language == "${lang}"][0].value)
    && defined(${field}.url[language == "${lang}"][0].value)
    => ${field}{
      "label": label[language == "${lang}"][0].value,
      "url": url[language == "${lang}"][0].value
    }
  )`;
}

export const sanityCtaSchema = z.strictObject({
  label: z.string().min(1),
  url: z.string().min(1),
});

export type SanityCta = z.infer<typeof sanityCtaSchema>;
