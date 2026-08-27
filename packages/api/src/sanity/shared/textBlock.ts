import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

import { optionalCtaProjection, sanityCtaSchema } from "./cta";
import { richTextProjection, sanityRichTextSchema } from "./richText";

export function textBlockProjection({
  field,
  lang,
}: {
  field: string;
  lang: Lang;
}) {
  return `${field}{
    "badge": badge[language == "${lang}"][0].value,
    "title": title[language == "${lang}"][0].value,
    "body": ${richTextProjection({ field: "body", lang })},
    "additionalCtas": additionalCtas[
      defined(label[language == "${lang}"][0].value)
      && defined(url[language == "${lang}"][0].value)
    ]{
      "label": label[language == "${lang}"][0].value,
      "url": url[language == "${lang}"][0].value
    },
    "cta": ${optionalCtaProjection({ field: "cta", lang })},
    "ctaTone": coalesce(ctaTone, "red")
  }`;
}

export const sanityTextBlockSchema = z.strictObject({
  badge: z.string().min(1).nullable(),
  title: z.string().min(1),
  body: sanityRichTextSchema,
  additionalCtas: z.array(sanityCtaSchema).max(3).nullable(),
  cta: sanityCtaSchema.nullable(),
  ctaTone: z.enum(["red", "blue"]),
});

export type SanityTextBlock = z.infer<typeof sanityTextBlockSchema>;
