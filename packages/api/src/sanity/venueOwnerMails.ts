import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

function venueOwnerMailsQuery({ venueSlug }: { venueSlug: string }) {
  return defineQuery(`{
    "venue": *[_type == "venue" && slug.current == "${venueSlug}"][0]{
      ownerMails
    }
  }`);
}

const sanityVenueOwnerMailsSchema = z.strictObject({
  venue: z.strictObject({
    ownerMails: z.array(z.email()).min(1),
  }),
});

export type SanityVenueOwnerMails = z.infer<typeof sanityVenueOwnerMailsSchema>;

export async function fetchVenueOwnerMails({
  config,
  venueSlug,
}: {
  config: SanityConfig;
  venueSlug: string;
}) {
  return fetchSanityData({
    queryName: "venueOwnerMails",
    query: venueOwnerMailsQuery({ venueSlug }),
    schema: sanityVenueOwnerMailsSchema,
    config,
  });
}
