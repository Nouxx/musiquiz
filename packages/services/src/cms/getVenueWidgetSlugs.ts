import { fetchVenueWidgetSlugs } from "@repo/api/sanity/venueWidgetSlugs";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenueWidgetPageType } from "./types";

export async function getVenueWidgetSlugs({
  config,
  pageType,
}: {
  config: SanityConfig;
  pageType: VenueWidgetPageType;
}) {
  const data = await fetchVenueWidgetSlugs({ config, pageType });

  return data.map((venue) => venue.slug);
}
