import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import type { VenueWidgetPageType } from "./venueWidgetPage";

// a venue whose provider is not 4escape has no widget page
function venueWidgetSlugsQuery({
  pageType,
}: {
  pageType: VenueWidgetPageType;
}) {
  const providerField =
    pageType === "book" ? "bookingProvider" : "giftingProvider";

  return defineQuery(`*[_type == "venue" && ${providerField} == "4escape"]{
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
  pageType,
}: {
  config: SanityConfig;
  pageType: VenueWidgetPageType;
}) {
  return fetchSanityData({
    queryName: "venueWidgetSlugs",
    query: venueWidgetSlugsQuery({ pageType }),
    schema: sanityVenueWidgetSlugsSchema,
    config,
  });
}
