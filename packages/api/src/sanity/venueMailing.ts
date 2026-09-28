import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

function venueMailingQuery({ venueSlug }: { venueSlug: string }) {
  return defineQuery(`{
    "venue": *[_type == "venue" && slug.current == "${venueSlug}"][0]{
      title,
      ownerMails
    }
  }`);
}

const sanityVenueMailingSchema = z.strictObject({
  venue: z.strictObject({
    title: z.string().min(1),
    ownerMails: z.array(z.email()).min(1),
  }),
});

export type SanityVenueMailing = z.infer<typeof sanityVenueMailingSchema>;

export async function fetchVenueMailing({
  config,
  venueSlug,
}: {
  config: SanityConfig;
  venueSlug: string;
}) {
  return fetchSanityData({
    queryName: "venueMailing",
    query: venueMailingQuery({ venueSlug }),
    schema: sanityVenueMailingSchema,
    config,
  });
}
