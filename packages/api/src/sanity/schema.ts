import { z } from "zod";

export const SanityHomepageSchema = z.strictObject({
  heading: z.string().min(1),
});
