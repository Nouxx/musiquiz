import { z } from "zod";

export const SanityVenueSchema = z.strictObject({
  title: z.string().min(1),
});

export const SanityVenuesResponseSchema = z.array(SanityVenueSchema);
