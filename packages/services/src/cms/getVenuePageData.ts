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
import { toCmsImage } from "./utils/toCmsImage";

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
  const { media, logo, heading, subHeading, badge, ctaLabel } =
    data.venuePage.pageCover;

  return {
    pageCover: {
      media: toCmsImage(media),
      logo: logo ? toCmsImage(logo) : undefined,
      heading,
      subHeading: subHeading ?? undefined,
      badge: badge ?? undefined,
      cta: {
        label: ctaLabel,
        url: ctaUrl({ lang, venueSlug, pageType }),
      },
    },
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
