import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

const pricesTypes = `["venuePrices", "gamePrices"]`;

// only the arrays each page renders: a hidden field keeps its old value
const renderedComponents = `select(
  _type == "whereToFindUsPage" =>
    coalesce(componentsBeforeMap, []) + coalesce(componentsAfterMap, []),
  pageType in ["book", "gift"] =>
    coalesce(componentsBeforeWidget, []) + coalesce(componentsAfterWidget, []),
  coalesce(pageComponents, [])
)`;

function siteAnchorsQuery() {
  return defineQuery(`{
    "pages": *[_type in [
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
      "hasPrices": count(${renderedComponents}[_type in ${pricesTypes}]) > 0,
      "anchors": ${renderedComponents}[
        defined(anchor) && !(_type in ${pricesTypes})
      ]{ "component": _type, anchor }
    }[hasPrices || count(anchors) > 0],
    "termsVenueSlugs": *[_type == "venue" && count(terms) > 0].slug.current
  }`);
}

const sanitySiteAnchorsSchema = z.strictObject({
  pages: z.array(
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
      hasPrices: z.boolean(),
      anchors: z.array(
        z.strictObject({
          component: z.string().min(1),
          anchor: z.string().min(1),
        }),
      ),
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
