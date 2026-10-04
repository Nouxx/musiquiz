import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { optionalCtaProjection, sanityCtaSchema } from "./shared/cta";
import { imageProjection, sanityImageSchema } from "./shared/image";
import {
  pageComponentsProjection,
  sanityPageComponentSchema,
} from "./shared/pageComponents";
import { sanitySeoSchema, seoProjection } from "./shared/seo";

function homepageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "homepage": *[_type == "homepage"][0]{
      "badge": badge[language == "${lang}"][0].value,
      "heading": heading[language == "${lang}"][0].value,
      logo ${imageProjection({ lang })},
      cover ${imageProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ field: "pageComponents", lang })},
      "venuesCta": ${optionalCtaProjection({ field: "venuesCta", lang })},
      "seo": ${seoProjection({ lang })},
    },
    "venues": *[_type == "venue"] | order(title asc){
      "title": title,
      "slug": slug.current,
      regionCode,
      "mapPosition": mapPosition{ x, y }
    },
    "siteSettings": *[_type == "siteSettings"][0]{
      footerLogo ${imageProjection({ lang })},
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      tiktokUrl,
      youtubeUrl,
      mainPhone,
      mainEmail,
    },
  }`);
}

const sanityHomepageSchema = z.strictObject({
  homepage: z.strictObject({
    badge: z.string().min(1),
    heading: z.string().min(1),
    logo: sanityImageSchema,
    cover: sanityImageSchema,
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
    venuesCta: sanityCtaSchema.nullable(),
    seo: sanitySeoSchema,
  }),
  venues: z.array(
    z.strictObject({
      title: z.string(),
      slug: z.string(),
      regionCode: z.string(),
      mapPosition: z.strictObject({ x: z.number(), y: z.number() }),
    }),
  ),
  siteSettings: z.strictObject({
    footerLogo: sanityImageSchema,
    facebookUrl: z.url(),
    instagramUrl: z.url(),
    linkedinUrl: z.url(),
    tiktokUrl: z.url(),
    youtubeUrl: z.url(),
    mainPhone: z.string().min(1),
    mainEmail: z.email(),
  }),
});

export type SanityHomepage = z.infer<typeof sanityHomepageSchema>;

export async function fetchHomepage({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  return fetchSanityData({
    queryName: "homepage",
    query: homepageQuery({ lang }),
    schema: sanityHomepageSchema,
    config,
  });
}
