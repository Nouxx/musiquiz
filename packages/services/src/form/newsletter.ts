import z from "zod";

import { venueSlugSchema } from "./venueSlugSchema";

export const newsletterFormLimits = {
  mail: 254,
};

export const newsletterFormBodySchema = z.strictObject({
  venueSlug: venueSlugSchema,
  mail: z.email().max(newsletterFormLimits.mail),
  rgpd: z.literal(true),
});
