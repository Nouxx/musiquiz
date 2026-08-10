import { fetchVenueSlugs } from "@repo/api/sanity/venueSlugs";
import type { SanityConfig } from "@repo/utils/sanityConfig";

export async function getVenueSlugs({ config }: { config: SanityConfig }) {
  const data = await fetchVenueSlugs({ config });

  return data.map((venue) => venue.slug);
}
