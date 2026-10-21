import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

// counts only the arrays each page renders: a hidden field keeps its old value
function siteAnchorsQuery() {
  return defineQuery(`{
    "pricesPages": *[_type in [
      "homepage",
      "whereToFindUsPage",
      "joinTheNetworkPage",
      "globalGame",
      "globalEvent",
      "venuePage",
      "venueGame",
      "venueEvent",
      "venueCustomPage"
    ]]{
      _type,
      "pageType": coalesce(pageType, null),
      "venueSlug": coalesce(venue->slug.current, null),
      "slug": coalesce(game->slug.current, event->slug.current, slug.current, null),
      "hasPrices": count(select(
        _type == "whereToFindUsPage" =>
          coalesce(componentsBeforeMap, []) + coalesce(componentsAfterMap, []),
        pageType in ["book", "gift"] =>
          coalesce(componentsBeforeWidget, []) + coalesce(componentsAfterWidget, []),
        coalesce(pageComponents, [])
      )[_type in ["venuePrices", "gamePrices"]]) > 0
    }[hasPrices]{ _type, pageType, venueSlug, slug },
    "termsVenueSlugs": *[_type == "venue" && count(terms) > 0].slug.current
  }`);
}

const sanitySiteAnchorsSchema = z.strictObject({
  pricesPages: z.array(
    z.strictObject({
      _type: z.enum([
        "homepage",
        "whereToFindUsPage",
        "joinTheNetworkPage",
        "globalGame",
        "globalEvent",
        "venuePage",
        "venueGame",
        "venueEvent",
        "venueCustomPage",
      ]),
      pageType: z.enum(["home", "book", "gift"]).nullable(),
      venueSlug: z.string().min(1).nullable(),
      slug: z.string().min(1).nullable(),
    }),
  ),
  termsVenueSlugs: z.array(z.string().min(1)),
});

export type SanitySiteAnchors = z.infer<typeof sanitySiteAnchorsSchema>;

export async function fetchSiteAnchors({ config }: { config: SanityConfig }) {
  return fetchSanityData({
    queryName: "siteAnchors",
    query: siteAnchorsQuery(),
    schema: sanitySiteAnchorsSchema,
    config,
  });
}
