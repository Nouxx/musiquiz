import { fetchVenueCustomPageSlugs } from "@repo/api/sanity/venueCustomPageSlugs";
import type { SanityConfig } from "@repo/utils/sanityConfig";

export async function getVenueCustomPageSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  return fetchVenueCustomPageSlugs({ config });
}
