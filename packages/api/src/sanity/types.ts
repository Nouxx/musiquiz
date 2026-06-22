import type { z } from "zod";

import type { SanityHomepageSchema } from "./schema";

export type SanityHomepage = z.infer<typeof SanityHomepageSchema>;
