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

export type VenueWidgetPageType = "gift" | "book";

function venueWidgetPageQuery({
  lang,
  venueSlug,
  pageType,
}: {
  lang: Lang;
  venueSlug: string;
  pageType: VenueWidgetPageType;
}) {
  return defineQuery(`{
    "venuePage": *[_type == "venuePage"
      && venue->slug.current == "${venueSlug}"
      && pageType == "${pageType}"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "componentsBeforeWidget": ${pageComponentsProjection({ field: "componentsBeforeWidget", lang })},
      "componentsAfterWidget": ${pageComponentsProjection({ field: "componentsAfterWidget", lang })},
    }
  }`);
}

const sanityVenueWidgetPageSchema = z.strictObject({
  venuePage: z.strictObject({
    // the cover's buttons point at the widget's anchor, which only `apps/web` knows
    pageCover: sanityPageCoverSchema({ hasCta: false }),
    componentsBeforeWidget: z.array(sanityPageComponentSchema).nullable(),
    componentsAfterWidget: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityVenueWidgetPage = z.infer<typeof sanityVenueWidgetPageSchema>;

export async function fetchVenueWidgetPage({
  config,
  lang,
  venueSlug,
  pageType,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
  pageType: VenueWidgetPageType;
}) {
  return fetchSanityData({
    query: venueWidgetPageQuery({ lang, venueSlug, pageType }),
    schema: sanityVenueWidgetPageSchema,
    config,
  });
}
