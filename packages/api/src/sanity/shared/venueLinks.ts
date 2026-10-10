import { z } from "zod";

// a url is dropped once its provider is not external, so a leftover value never leaks
export const venueLinksProjection = `{
  "slug": slug.current,
  "booking": {
    "provider": bookingProvider,
    bookingProvider == "external" => { "url": externalBookingUrl }
  },
  "gifting": {
    "provider": giftingProvider,
    giftingProvider == "external" => { "url": externalGiftingUrl }
  }
}`;

const fourEscapeSchema = z.strictObject({ provider: z.literal("4escape") });
const externalSchema = z.strictObject({
  provider: z.literal("external"),
  url: z.url(),
});

export const sanityVenueLinksSchema = z.strictObject({
  slug: z.string().min(1),
  booking: z.discriminatedUnion("provider", [fourEscapeSchema, externalSchema]),
  gifting: z.discriminatedUnion("provider", [
    fourEscapeSchema,
    externalSchema,
    z.strictObject({ provider: z.literal("none") }),
  ]),
});

export type SanityVenueLinks = z.infer<typeof sanityVenueLinksSchema>;
