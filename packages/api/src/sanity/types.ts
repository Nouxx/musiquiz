import type { z } from "zod";

import type {
  SanityHomepageSchema,
  SanityImageSchema,
  SanityPageComponentSchema,
  SanityVenueHomepageSchema,
  SanityVenuesSlugSchema,
} from "./schema";

export type SanityImage = z.infer<typeof SanityImageSchema>;

export type SanityHomepage = z.infer<typeof SanityHomepageSchema>;
export type SanityVenueHomepage = z.infer<typeof SanityVenueHomepageSchema>;

export type SanityVenuesSlug = z.infer<typeof SanityVenuesSlugSchema>;

export type SanityPageComponent = z.infer<typeof SanityPageComponentSchema>;
