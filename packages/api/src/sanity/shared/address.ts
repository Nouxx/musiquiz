import { z } from "zod";

export const addressProjection = `{
  streetAddress,
  postalCode,
  addressLocality,
  addressCountry
}`;

export const sanityAddressSchema = z.strictObject({
  streetAddress: z.string().min(1),
  postalCode: z.string().min(1),
  addressLocality: z.string().min(1),
  addressCountry: z.string().length(2),
});

export type SanityAddress = z.infer<typeof sanityAddressSchema>;
