import type { z } from "zod";

import type { SanityFooterSchema, SanityHomepageSchema } from "./schema";

export type SanityHomepage = z.infer<typeof SanityHomepageSchema>;

export type SanityFooter = z.infer<typeof SanityFooterSchema>;
