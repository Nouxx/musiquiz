import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import {
  pageComponentsProjection,
  sanityPageComponentSchema,
} from "./shared/pageComponents";
import { pageCoverProjection, sanityPageCoverSchema } from "./shared/pageCover";
import { sanitySeoSchema, seoProjection } from "./shared/seo";

function venueCustomPageQuery({
  lang,
  venueSlug,
  pageSlug,
}: {
  lang: Lang;
  venueSlug: string;
  pageSlug: string;
}) {
  return defineQuery(`{
    "venueCustomPage": *[_type == "venueCustomPage"
      && venue->slug.current == "${venueSlug}"
      && slug.current == "${pageSlug}"][0]{
      "venueTitle": venue->title,
      "title": title[language == "${lang}"][0].value,
      pageCover ${pageCoverProjection({ lang })},
      "seo": ${seoProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ field: "pageComponents", lang })},
    }
  }`);
}

const sanityVenueCustomPageSchema = z.strictObject({
  venueCustomPage: z.strictObject({
    venueTitle: z.string().min(1),
    title: z.string().min(1),
    pageCover: sanityPageCoverSchema({ hasCta: true }),
    seo: sanitySeoSchema,
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityVenueCustomPage = z.infer<typeof sanityVenueCustomPageSchema>;

export async function fetchVenueCustomPage({
  config,
  lang,
  venueSlug,
  pageSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
  pageSlug: string;
}) {
  return fetchSanityData({
    queryName: "venueCustomPage",
    query: venueCustomPageQuery({ lang, venueSlug, pageSlug }),
    schema: sanityVenueCustomPageSchema,
    config,
    lang,
  });
}
