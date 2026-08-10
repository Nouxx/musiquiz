import type { z } from "zod";

import type {
  SanityImageSchema,
  SanityPageComponentSchema,
  SanityVenuesSlugSchema,
} from "./schema";

export type SanityImage = z.infer<typeof SanityImageSchema>;


export type SanityVenuesSlug = z.infer<typeof SanityVenuesSlugSchema>;

export type SanityPageComponent = z.infer<typeof SanityPageComponentSchema>;
