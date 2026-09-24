import {
  fetchVenueWidgetPage,
  type SanityVenueWidgetPage,
} from "@repo/api/sanity/venueWidgetPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenueWidgetPage, VenueWidgetPageType } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";

function adaptVenueWidgetPage({
  data,
}: {
  data: SanityVenueWidgetPage;
}): VenueWidgetPage {
  return {
    pageCover: toPageCover({ data: data.venuePage.pageCover }),
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
