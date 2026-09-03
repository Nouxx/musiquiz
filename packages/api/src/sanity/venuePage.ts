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

function venuePageQuery({
  lang,
  venueSlug,
}: {
  lang: Lang;
  venueSlug: string;
}) {
  return defineQuery(`{
    "venuePage": *[_type == "venuePage"
      && venue->slug.current == "${venueSlug}"
      && pageType == "home"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ field: "pageComponents", lang })},
    }
  }`);
}

const sanityVenuePageSchema = z.strictObject({
  venuePage: z.strictObject({
    pageCover: sanityPageCoverSchema({ hasCta: true }),
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityVenuePage = z.infer<typeof sanityVenuePageSchema>;

export async function fetchVenuePage({
  config,
  lang,
  venueSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
}) {
  return fetchSanityData({
    query: venuePageQuery({ lang, venueSlug }),
    schema: sanityVenuePageSchema,
    config,
  });
}
