import { fetchVenueGameSlugs } from "@repo/api/sanity/venueGameSlugs";
import type { SanityConfig } from "@repo/utils/sanityConfig";

export async function getVenueGameSlugs({ config }: { config: SanityConfig }) {
  return fetchVenueGameSlugs({ config });
}
