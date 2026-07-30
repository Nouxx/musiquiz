import type { z } from "zod";

import type {
  SanityHeaderSchema,
  SanityHomepageSchema,
  SanitySiteSettingsSchema,
  SanityVenueSchema,
  SanityVenuesResponseSchema,
} from "./schema";

export type SanityVenue = z.infer<typeof SanityVenueSchema>;
export type SanityVenuesResponse = z.infer<typeof SanityVenuesResponseSchema>;

export type SanityHeader = z.infer<typeof SanityHeaderSchema>;

export type SanityHomepage = z.infer<typeof SanityHomepageSchema>;

export type SanitySiteSettings = z.infer<typeof SanitySiteSettingsSchema>;
