import type { Lang } from "@repo/utils/lang";
import { z } from "zod";

import { imageProjection, sanityImageSchema } from "./image";

const siteOgImage = `*[_type == "siteSettings"][0].ogImage`;

// a missing `pageCover` or `venue` skips its step
export function seoProjection({ lang }: { lang: Lang }) {
  return `{
    "title": seo.title[language == "${lang}"][0].value,
    "description": seo.description[language == "${lang}"][0].value,
    "ogImage": select(
      defined(seo.ogImage.asset) => seo.ogImage,
      pageCover.background == "image" && defined(pageCover.media.asset) => pageCover.media,
      defined(venue->ogImage.asset) => venue->ogImage,
      ${siteOgImage}
    ) ${imageProjection({ lang })},
    "noindex": coalesce(seo.noindex, false),
  }`;
}

// french only, plain strings: docs/adr/0013
export function blogSeoProjection() {
  return `{
    "title": seo.title,
    "description": seo.description,
    "ogImage": select(
      defined(seo.ogImage.asset) => seo.ogImage,
      defined(cover.asset) => cover,
      ${siteOgImage}
    ) ${imageProjection({ lang: "fr" })},
    "noindex": coalesce(seo.noindex, false),
  }`;
}

export const sanitySeoSchema = z.strictObject({
  title: z.string().min(1).nullable(),
  description: z.string().min(1).nullable(),
  ogImage: sanityImageSchema,
  noindex: z.boolean(),
});

export type SanitySeo = z.infer<typeof sanitySeoSchema>;
