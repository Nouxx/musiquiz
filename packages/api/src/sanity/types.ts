import type { z } from "zod";

import type {
  SanityFooterSchema,
  SanityHeaderSchema,
  SanityHomepageSchema,
  SanityVenueFooterSchema,
  SanityVenueHomepageSchema,
  SanityVenuesSlugSchema,
} from "./schema";

export type SanityHomepage = z.infer<typeof SanityHomepageSchema>;
export type SanityVenueHomepage = z.infer<typeof SanityVenueHomepageSchema>;

export type SanityFooter = z.infer<typeof SanityFooterSchema>;
export type SanityVenueFooter = z.infer<typeof SanityVenueFooterSchema>;

export type SanityVenuesSlug = z.infer<typeof SanityVenuesSlugSchema>;

export type SanityHeader = z.infer<typeof SanityHeaderSchema>;
