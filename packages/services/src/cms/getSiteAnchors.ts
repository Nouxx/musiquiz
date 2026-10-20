import {
  fetchSiteAnchors,
  type SanitySiteAnchors,
} from "@repo/api/sanity/siteAnchors";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { PricesPage, SiteUrlRoute } from "../routing/siteUrls";

type SanityPricesPage = SanitySiteAnchors["pricesPages"][number];

const routes = {
  homepage: "home",
  whereToFindUsPage: "whereToFindUs",
  joinTheNetworkPage: "joinTheNetwork",
  globalGame: "game",
  globalEvent: "event",
  venueGame: "venueGame",
  venueEvent: "venueEvent",
  venueCustomPage: "venueCustomPage",
} satisfies Record<
  Exclude<SanityPricesPage["_type"], "venuePage">,
  SiteUrlRoute
>;

function toRoute(page: SanityPricesPage): SiteUrlRoute {
  if (page._type !== "venuePage") return routes[page._type];
  if (page.pageType === "book") return "venueBook";
  if (page.pageType === "gift") return "venueGifting";
  return "venueHome";
}

function toPricesPage(page: SanityPricesPage): PricesPage {
  return {
    route: toRoute(page),
    venueSlug: page.venueSlug ?? undefined,
    slug: page.slug ?? undefined,
  };
}

export async function getSiteAnchors({ config }: { config: SanityConfig }) {
  const data = await fetchSiteAnchors({ config });

  return {
    pricesPages: data.pricesPages.map((page) => toPricesPage(page)),
    termsVenueSlugs: data.termsVenueSlugs,
  };
}
