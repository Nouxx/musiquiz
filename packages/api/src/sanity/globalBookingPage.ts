import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { pageCoverProjection, sanityPageCoverSchema } from "./shared/pageCover";
import { sanitySeoSchema, seoProjection } from "./shared/seo";
import {
  sanityVenueLinksSchema,
  venueLinksProjection,
} from "./shared/venueLinks";

function globalBookingPageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "page": *[_type == "globalBookingPage"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "seo": ${seoProjection({ lang })},
    },
    "venues": *[_type == "venue"] | order(title asc){
      "title": title,
      regionCode,
      "mapPosition": mapPosition{ x, y },
      "links": ${venueLinksProjection}
    },
  }`);
}

const sanityGlobalBookingPageSchema = z.strictObject({
  page: z.strictObject({
    pageCover: sanityPageCoverSchema({ hasCta: false }),
    seo: sanitySeoSchema,
  }),
  venues: z.array(
    z.strictObject({
      title: z.string(),
      regionCode: z.string(),
      mapPosition: z.strictObject({ x: z.number(), y: z.number() }),
      links: sanityVenueLinksSchema,
    }),
  ),
});

export type SanityGlobalBookingPage = z.infer<
  typeof sanityGlobalBookingPageSchema
>;

export async function fetchGlobalBookingPage({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  return fetchSanityData({
    queryName: "globalBookingPage",
    query: globalBookingPageQuery({ lang }),
    schema: sanityGlobalBookingPageSchema,
    config,
  });
}
