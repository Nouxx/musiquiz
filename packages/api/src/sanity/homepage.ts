import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { optionalCtaProjection, sanityCtaSchema } from "./shared/cta";
import {
  pageComponentsProjection,
  sanityPageComponentSchema,
} from "./shared/pageComponents";
import { pageCoverProjection, sanityPageCoverSchema } from "./shared/pageCover";
import { sanitySeoSchema, seoProjection } from "./shared/seo";

function homepageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "homepage": *[_type == "homepage"][0]{
      pageCover ${pageCoverProjection({ lang })},
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
  }`);
}

const sanityHomepageSchema = z.strictObject({
  homepage: z.strictObject({
    pageCover: sanityPageCoverSchema({ hasCta: false }),
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
