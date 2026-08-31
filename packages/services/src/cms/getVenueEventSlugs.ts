import { fetchVenueEventSlugs } from "@repo/api/sanity/venueEventSlugs";
import type { SanityConfig } from "@repo/utils/sanityConfig";

export async function getVenueEventSlugs({ config }: { config: SanityConfig }) {
  return fetchVenueEventSlugs({ config });
}
