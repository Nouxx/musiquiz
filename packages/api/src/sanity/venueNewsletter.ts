import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

function venueNewsletterQuery({ venueSlug }: { venueSlug: string }) {
  return defineQuery(`{
    "venue": *[_type == "venue" && slug.current == "${venueSlug}"][0]{
      title,
      ownerMails,
      "provider": newsletterProvider,
      newsletterProvider == "brevo" => { brevoListId }
    }
  }`);
}

// brevo keeps ownerMails too: its sign-ups fall back to mailing the owners
const venueMailingFields = {
  title: z.string().min(1),
  ownerMails: z.array(z.email()).min(1),
};

const sanityVenueNewsletterSchema = z.strictObject({
  venue: z.discriminatedUnion("provider", [
    z.strictObject({
      ...venueMailingFields,
      provider: z.literal("brevo"),
      brevoListId: z.number().int().positive(),
    }),
    z.strictObject({
      ...venueMailingFields,
      provider: z.literal("zeptomail"),
    }),
  ]),
});

export type SanityVenueNewsletter = z.infer<typeof sanityVenueNewsletterSchema>;

export async function fetchVenueNewsletter({
  config,
  venueSlug,
}: {
  config: SanityConfig;
  venueSlug: string;
}) {
  return fetchSanityData({
    queryName: "venueNewsletter",
    query: venueNewsletterQuery({ venueSlug }),
    schema: sanityVenueNewsletterSchema,
    config,
  });
}
