import type { z } from "zod";

import type {
  SanityFooterSchema,
  SanityHeaderSchema,
  SanityHomepageSchema,
  SanityVenuesSlugSchema,
} from "./schema";

export type SanityHomepage = z.infer<typeof SanityHomepageSchema>;

export type SanityFooter = z.infer<typeof SanityFooterSchema>;

export type SanityVenuesSlug = z.infer<typeof SanityVenuesSlugSchema>;

export type SanityHeader = z.infer<typeof SanityHeaderSchema>;
