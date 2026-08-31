import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

// the event routes exist for the pairs that were authored
function venueEventSlugsQuery() {
  return defineQuery(`*[_type == "venueEvent"]
    | order(coalesce(event->displayOrder, 999) asc, event->name asc){
    "venueSlug": venue->slug.current,
    "eventSlug": event->slug.current
  }`);
}

const sanityVenueEventSlugsSchema = z.array(
  z.strictObject({
    venueSlug: z.string().min(1),
    eventSlug: z.string().min(1),
  }),
);

export type SanityVenueEventSlugs = z.infer<typeof sanityVenueEventSlugsSchema>;

export async function fetchVenueEventSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  return fetchSanityData({
    query: venueEventSlugsQuery(),
    schema: sanityVenueEventSlugsSchema,
    config,
  });
}
