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

function whereToFindUsPageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "page": *[_type == "whereToFindUsPage"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "componentsBeforeMap": ${pageComponentsProjection({ field: "componentsBeforeMap", lang })},
      "venuesCta": ${optionalCtaProjection({ field: "venuesCta", lang })},
      "componentsAfterMap": ${pageComponentsProjection({ field: "componentsAfterMap", lang })},
    },
    "venues": *[_type == "venue"] | order(title asc){
      "title": title,
      "slug": slug.current,
      regionCode,
      "mapPosition": mapPosition{ x, y }
    },
  }`);
}

const sanityWhereToFindUsPageSchema = z.strictObject({
  page: z.strictObject({
    pageCover: sanityPageCoverSchema({ hasCta: true }),
    componentsBeforeMap: z.array(sanityPageComponentSchema).nullable(),
    venuesCta: sanityCtaSchema.nullable(),
    componentsAfterMap: z.array(sanityPageComponentSchema).nullable(),
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

export type SanityWhereToFindUsPage = z.infer<
  typeof sanityWhereToFindUsPageSchema
>;

export async function fetchWhereToFindUsPage({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  return fetchSanityData({
    query: whereToFindUsPageQuery({ lang }),
    schema: sanityWhereToFindUsPageSchema,
    config,
  });
}
