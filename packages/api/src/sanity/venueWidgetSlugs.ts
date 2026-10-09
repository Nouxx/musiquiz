import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

// a venue hosted by a partner books and gifts on the partner's site
function venueWidgetSlugsQuery() {
  return defineQuery(`*[_type == "venue" && hostedByPartner != true]{
    "slug": slug.current
  }`);
}

const sanityVenueWidgetSlugsSchema = z.array(
  z.strictObject({ slug: z.string() }),
);

export type SanityVenueWidgetSlugs = z.infer<
  typeof sanityVenueWidgetSlugsSchema
>;

export async function fetchVenueWidgetSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  return fetchSanityData({
    queryName: "venueWidgetSlugs",
    query: venueWidgetSlugsQuery(),
    schema: sanityVenueWidgetSlugsSchema,
    config,
  });
}
