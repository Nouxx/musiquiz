import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

function trackingQuery({ venueSlug }: { venueSlug: string | undefined }) {
  const venueGtmId = venueSlug
    ? `*[_type == "venue" && slug.current == "${venueSlug}"][0].gtmId`
    : "null";

  return defineQuery(`{
    "globalGtmId": *[_type == "siteSettings"][0].globalGtmId,
    "venueGtmId": ${venueGtmId}
  }`);
}

const sanityTrackingSchema = z.strictObject({
  globalGtmId: z.string().nullable(),
  venueGtmId: z.string().nullable(),
});

export type SanityTracking = z.infer<typeof sanityTrackingSchema>;

export async function fetchTracking({
  config,
  venueSlug,
}: {
  config: SanityConfig;
  venueSlug: string | undefined;
}) {
  return fetchSanityData({
    queryName: "tracking",
    query: trackingQuery({ venueSlug }),
    schema: sanityTrackingSchema,
    config,
  });
}
