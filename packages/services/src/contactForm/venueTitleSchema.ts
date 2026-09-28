import z from "zod";

// ends up as the mail sender name; the cap matches the venue schema
export const venueTitleSchema = z
  .string()
  .min(1)
  .max(30)
  .regex(/^[^\p{Cc}]+$/u);
