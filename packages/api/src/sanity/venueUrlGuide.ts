import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import {
  sanityVenueLinksSchema,
  venueLinksProjection,
} from "./shared/venueLinks";

// display only: which pages exist is decided by the *Slugs queries the build uses
function venueUrlGuideQuery() {
  return defineQuery(`*[_type == "venue"] | order(title asc){
    title,
    "links": ${venueLinksProjection}
  }`);
}

// the build's venue links schema, so the guide rejects what the build rejects
const sanityVenueUrlGuideSchema = z.array(
  z.strictObject({
    title: z.string(),
    links: sanityVenueLinksSchema,
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
