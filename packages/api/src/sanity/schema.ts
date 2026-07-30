import { z } from "zod";

export const SanityVenueSchema = z.strictObject({
  title: z.string().min(1),
  slug: z.string(),
});

export const SanityVenuesResponseSchema = z.array(SanityVenueSchema);

export const SanityHeaderSchema = z.strictObject({
  logo: z.string().min(1),
});

export const SanityHomepageSchema = z.strictObject({
  logo: z.string().min(1),
  badge: z.string().min(1),
  heading: z.string().min(1),
});

export const SanitySiteSettingsSchema = z.strictObject({
  headerLogo: z.string(),
  footerLogo: z.string(),
  facebookUrl: z.url(),
  instagramUrl: z.url(),
  linkedinUrl: z.url(),
  tiktokUrl: z.url(),
  youtubeUrl: z.url(),
  mainPhone: z.string(), // todo: stricter phone validation
  mainEmail: z.email(),
});
