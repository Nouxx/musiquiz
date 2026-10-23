import {
  fetchSiteAnchors,
  type SanitySiteAnchors,
} from "@repo/api/sanity/siteAnchors";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type {
  CustomAnchorPage,
  PageKey,
  SiteUrlRoute,
} from "../routing/siteUrls";

type SanityPage = SanitySiteAnchors["pages"][number];

const routes = {
  homepage: "home",
  whereToFindUsPage: "whereToFindUs",
  joinTheNetworkPage: "joinTheNetwork",
  globalGame: "game",
  globalEvent: "event",
  venueGame: "venueGame",
  venueEvent: "venueEvent",
  venueCustomPage: "venueCustomPage",
} satisfies Record<Exclude<SanityPage["_type"], "venuePage">, SiteUrlRoute>;

function toRoute(page: SanityPage): SiteUrlRoute {
  if (page._type !== "venuePage") return routes[page._type];
  if (page.pageType === "book") return "venueBook";
  if (page.pageType === "gift") return "venueGifting";
  return "venueHome";
}

function toPageKey(page: SanityPage): PageKey {
  return {
    route: toRoute(page),
    venueSlug: page.venueSlug ?? undefined,
    slug: page.slug ?? undefined,
  };
}

function toCustomAnchorPage(page: SanityPage): CustomAnchorPage {
  return {
    ...toPageKey(page),
    anchors: page.anchors.map(({ component, anchor }) => ({
      component,
      id: anchor,
    })),
  };
}

export async function getSiteAnchors({ config }: { config: SanityConfig }) {
  const data = await fetchSiteAnchors({ config });

  return {
    pricesPages: data.pages
      .filter((page) => page.hasPrices)
      .map((page) => toPageKey(page)),
    customAnchorPages: data.pages
      .filter((page) => page.anchors.length > 0)
      .map((page) => toCustomAnchorPage(page)),
    termsVenueSlugs: data.termsVenueSlugs,
  };
}
