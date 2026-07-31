import { fetchSanityData } from "@repo/api/sanity/fetchData";
import { fetchVenuesSlug } from "@repo/api/sanity/queries";
import { SanityVenuesSlugSchema } from "@repo/api/sanity/schema";
import type { SanityConfig } from "@repo/utils/sanityConfig";

export async function getVenueSlugs({ config }: { config: SanityConfig }) {
  
    const data = await fetchSanityData({
      query: fetchVenuesSlug(),
      schema: SanityVenuesSlugSchema,
      config,
    });


  return data.map((venue) => venue.slug);
}
