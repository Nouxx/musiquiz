import { getVenueWidgetSlugs } from "@repo/services/cms/getVenueWidgetSlugs";
import type { VenueWidgetPageType } from "@repo/services/cms/types";

import { getSanityConfigFromEnvironment } from "./getSanityConfigFromEnvironment";

export async function getWidgetVenuesSlugParameters(
  pageType: VenueWidgetPageType,
) {
  const venueSlugs = await getVenueWidgetSlugs({
    config: getSanityConfigFromEnvironment(),
    pageType,
  });

  return venueSlugs.map((slug) => ({ params: { venue: slug } }));
}
