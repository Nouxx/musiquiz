/* eslint-disable unicorn/max-nested-calls */
// it's okay to nest zod function calls

import { z } from "zod";

export const SanityHomepageSchema = z.strictObject({
  homepage: z.strictObject({
    logo: z.string().min(1),
    badge: z.string().min(1),
    heading: z.string().min(1),
  }),
  venues: z.array(
    z.strictObject({
      title: z.string(),
      slug: z.string(),
    }),
  ),
});

export const SanityFooterSchema = z.strictObject({
  siteSettings: z.strictObject({
    facebookUrl: z.url(),
    footerLogo: z.string(),
    instagramUrl: z.url(),
    linkedinUrl: z.url(),
    mainEmail: z.email(),
    mainPhone: z.string(),
    tiktokUrl: z.url(),
    youtubeUrl: z.url(),
    acceptedPaymentMethods: z.array(
      z.strictObject({
        image: z.string(),
        imageAlt: z.string(),
      }),
    ),
  }),
  gameFormats: z.array(
    z.strictObject({
      name: z.string().min(1),
      slug: z.string().min(1),
    }),
  ),
  venues: z.array(
    z.strictObject({
      title: z.string(),
      slug: z.string(),
    }),
  ),
});

export const SanityVenuesSlugSchema = z.array(
  z.strictObject({ slug: z.string() }),
);

export const SanityHeaderSchema = z.strictObject({
  siteSettings: z.strictObject({
    headerLogo: z.string(),
  }),
  gameFormats: z.array(
    z.strictObject({
      game: z.strictObject({
        name: z.string(),
        slug: z.string(),
      }),
    }),
  ),
});
