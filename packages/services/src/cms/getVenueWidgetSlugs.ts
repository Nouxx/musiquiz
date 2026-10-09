import { fetchVenueWidgetSlugs } from "@repo/api/sanity/venueWidgetSlugs";
import type { SanityConfig } from "@repo/utils/sanityConfig";

export async function getVenueWidgetSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  const data = await fetchVenueWidgetSlugs({ config });

  return data.map((venue) => venue.slug);
}
