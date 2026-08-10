import type { z } from "zod";

import type {
  SanityHeaderSchema,
  SanityHomepageSchema,
  SanityImageSchema,
  SanityPageComponentSchema,
  SanityVenueFooterSchema,
  SanityVenueHomepageSchema,
  SanityVenuesSlugSchema,
} from "./schema";

export type SanityImage = z.infer<typeof SanityImageSchema>;

export type SanityHomepage = z.infer<typeof SanityHomepageSchema>;
export type SanityVenueHomepage = z.infer<typeof SanityVenueHomepageSchema>;

export type SanityVenueFooter = z.infer<typeof SanityVenueFooterSchema>;

export type SanityVenuesSlug = z.infer<typeof SanityVenuesSlugSchema>;

export type SanityHeader = z.infer<typeof SanityHeaderSchema>;

export type SanityPageComponent = z.infer<typeof SanityPageComponentSchema>;
