import type { z } from "zod";

import type {
  SanityImageSchema,
  SanityPageComponentSchema,
} from "./schema";

export type SanityImage = z.infer<typeof SanityImageSchema>;



export type SanityPageComponent = z.infer<typeof SanityPageComponentSchema>;
