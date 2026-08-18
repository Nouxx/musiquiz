import {
  fetchVenuePage,
  type SanityVenuePage,
  type VenuePageType,
} from "@repo/api/sanity/venuePage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { VenuePage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";

function ctaUrl({
  lang,
  venueSlug,
  pageType,
}: {
  lang: Lang;
  venueSlug: string;
  pageType: VenuePageType;
}) {
  const routes = getRoutesForLang(lang);

  switch (pageType) {
    case "home":
    case "gift": {
      return routes.venueBook(venueSlug);
    }
    case "book": {
      return routes.venueHome(venueSlug);
    }
  }
}

function adaptVenuePage({
  data,
  lang,
  venueSlug,
  pageType,
}: {
  data: SanityVenuePage;
  lang: Lang;
  venueSlug: string;
  pageType: VenuePageType;
}): VenuePage {
  return {
    pageCover: toPageCover({
      data: data.venuePage.pageCover,
      ctaUrl: ctaUrl({ lang, venueSlug, pageType }),
    }),
    components:
      data.venuePage.pageComponents?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
  };
}

export async function getVenuePageData({
  venueSlug,
  pageType,
  lang,
  config,
}: {
  venueSlug: string;
  pageType: VenuePageType;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchVenuePage({ config, lang, venueSlug, pageType });

  return adaptVenuePage({ data, lang, venueSlug, pageType });
}
