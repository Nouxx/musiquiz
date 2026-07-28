import type { z } from "zod";

import type { SanityVenueSchema, SanityVenuesResponseSchema } from "./schema";

export type SanityVenue = z.infer<typeof SanityVenueSchema>;
export type SanityVenuesResponse = z.infer<typeof SanityVenuesResponseSchema>;
