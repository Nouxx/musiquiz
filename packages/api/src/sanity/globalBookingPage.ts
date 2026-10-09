import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { pageCoverProjection, sanityPageCoverSchema } from "./shared/pageCover";
import { sanitySeoSchema, seoProjection } from "./shared/seo";

function globalBookingPageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "page": *[_type == "globalBookingPage"][0]{
      pageCover ${pageCoverProjection({ lang })},
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

const sanityGlobalBookingPageSchema = z.strictObject({
  page: z.strictObject({
    pageCover: sanityPageCoverSchema({ hasCta: false }),
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
