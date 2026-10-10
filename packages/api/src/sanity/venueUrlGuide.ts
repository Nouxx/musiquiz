import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

// display only: which pages exist is decided by the *Slugs queries the build uses
function venueUrlGuideQuery() {
  return defineQuery(`*[_type == "venue"] | order(title asc){
    title,
    "slug": slug.current,
    bookingProvider,
    externalBookingUrl,
    giftingProvider,
    externalGiftingUrl
  }`);
}

const sanityVenueUrlGuideSchema = z.array(
  z.strictObject({
    title: z.string(),
    slug: z.string(),
    bookingProvider: z.enum(["4escape", "external"]),
    externalBookingUrl: z.string().nullable(),
    giftingProvider: z.enum(["4escape", "external", "none"]),
    externalGiftingUrl: z.string().nullable(),
  }),
);

export type SanityVenueUrlGuide = z.infer<typeof sanityVenueUrlGuideSchema>;

export async function fetchVenueUrlGuide({ config }: { config: SanityConfig }) {
  return fetchSanityData({
    queryName: "venueUrlGuide",
    query: venueUrlGuideQuery(),
    schema: sanityVenueUrlGuideSchema,
    config,
  });
}
