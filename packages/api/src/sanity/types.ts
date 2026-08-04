import type { z } from "zod";

import type {
  SanityFooterSchema,
  SanityHeaderSchema,
  SanityHomepageSchema,
  SanityVenueHomepageSchema,
  SanityVenuesSlugSchema,
} from "./schema";

export type SanityHomepage = z.infer<typeof SanityHomepageSchema>;
export type SanityVenueHomepage = z.infer<typeof SanityVenueHomepageSchema>;

export type SanityFooter = z.infer<typeof SanityFooterSchema>;

export type SanityVenuesSlug = z.infer<typeof SanityVenuesSlugSchema>;

export type SanityHeader = z.infer<typeof SanityHeaderSchema>;
