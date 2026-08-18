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

export type VenuePageType = "home" | "gift" | "book";

function venuePageQuery({
  lang,
  venueSlug,
  pageType,
}: {
  lang: Lang;
  venueSlug: string;
  pageType: VenuePageType;
}) {
  return defineQuery(`{
    "venuePage": *[_type == "venuePage"
      && venue->slug.current == "${venueSlug}"
      && pageType == "${pageType}"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ lang })},
    }
  }`);
}

const sanityVenuePageSchema = z.strictObject({
  venuePage: z.strictObject({
    pageCover: sanityPageCoverSchema,
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityVenuePage = z.infer<typeof sanityVenuePageSchema>;

export async function fetchVenuePage({
  config,
  lang,
  venueSlug,
  pageType,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
  pageType: VenuePageType;
}) {
  return fetchSanityData({
    query: venuePageQuery({ lang, venueSlug, pageType }),
    schema: sanityVenuePageSchema,
    config,
  });
}
