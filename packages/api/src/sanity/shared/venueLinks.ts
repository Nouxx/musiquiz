import { z } from "zod";

// the partner links are dropped once the flag is off, so a leftover value never leaks
export const venueLinksProjection = `{
  "slug": slug.current,
  "hostedByPartner": hostedByPartner == true,
  "partnerBookingUrl": select(hostedByPartner == true => partnerBookingUrl),
  "partnerGiftingUrl": select(hostedByPartner == true => partnerGiftingUrl)
}`;

export const sanityVenueLinksSchema = z.discriminatedUnion("hostedByPartner", [
  z.strictObject({
    slug: z.string().min(1),
    hostedByPartner: z.literal(false),
    partnerBookingUrl: z.null(),
    partnerGiftingUrl: z.null(),
  }),
  z.strictObject({
    slug: z.string().min(1),
    hostedByPartner: z.literal(true),
    partnerBookingUrl: z.url(),
    partnerGiftingUrl: z.url().nullable(),
  }),
]);

export type SanityVenueLinks = z.infer<typeof sanityVenueLinksSchema>;
