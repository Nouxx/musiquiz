import {
  fetchVenueWidgetPage,
  type SanityVenueWidgetPage,
} from "@repo/api/sanity/venueWidgetPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenueWidgetPage, VenueWidgetPageType } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";
import { toSeo } from "./utils/toSeo";

function adaptVenueWidgetPage({
  data,
}: {
  data: SanityVenueWidgetPage;
}): VenueWidgetPage {
  return {
    venueTitle: data.venuePage.venueTitle,
    pageCover: toPageCover({ data: data.venuePage.pageCover }),
    seo: toSeo({
      data: data.venuePage.seo,
      fallback: {
        title: data.venuePage.pageCover.heading,
        description: data.venuePage.pageCover.subHeading,
      },
    }),
    componentsBeforeWidget:
      data.venuePage.componentsBeforeWidget?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
    componentsAfterWidget:
      data.venuePage.componentsAfterWidget?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
  };
}

export async function getVenueWidgetPageData({
  venueSlug,
  pageType,
  lang,
  config,
}: {
  venueSlug: string;
  pageType: VenueWidgetPageType;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchVenueWidgetPage({
    config,
    lang,
    venueSlug,
    pageType,
  });

  return adaptVenueWidgetPage({ data });
}
