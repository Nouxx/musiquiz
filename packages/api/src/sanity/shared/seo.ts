import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

export function seoProjection({ lang }: { lang: Lang }) {
  return `{
    "title": seo.title[language == "${lang}"][0].value,
    "description": seo.description[language == "${lang}"][0].value,
    "noindex": coalesce(seo.noindex, false),
  }`;
}

// french only, plain strings: docs/adr/0013
export function blogSeoProjection() {
  return `{
    "title": seo.title,
    "description": seo.description,
    "noindex": coalesce(seo.noindex, false),
  }`;
}

export const sanitySeoSchema = z.strictObject({
  title: z.string().min(1).nullable(),
  description: z.string().min(1).nullable(),
  noindex: z.boolean(),
});

export type SanitySeo = z.infer<typeof sanitySeoSchema>;
