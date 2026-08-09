/* eslint-disable unicorn/max-nested-calls */
// it's okay to nest zod function calls

import { z } from "zod";

export const SanityImageSchema = z.strictObject({
  url: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  mimeType: z.string().min(1),
  alt: z.string().min(1).nullable(),
});

export const SanityHomepageSchema = z.strictObject({
  homepage: z.strictObject({
    badge: z.string().min(1),
    heading: z.string().min(1),
    logo: SanityImageSchema,
    cover: SanityImageSchema,
  }),
  venues: z.array(
    z.strictObject({
      title: z.string(),
      slug: z.string(),
      regionCode: z.string(),
    }),
  ),
});

export const SanityVenueHomepageSchema = z.strictObject({
  pageCover: z.strictObject({
    pageCoverMedia: SanityImageSchema,
    pageCoverBadge: z.string().min(1).nullable(),
    pageCoverHeading: z.string().min(1),
    pageCoverSubHeading: z.string().min(1),
    pageCoverCtaLabel: z.string().min(1),
  }),
});

export const SanityFooterSchema = z.strictObject({
  siteSettings: z.strictObject({
    facebookUrl: z.url(),
    footerLogo: SanityImageSchema,
    instagramUrl: z.url(),
    linkedinUrl: z.url(),
    mainEmail: z.email(),
    mainPhone: z.string(),
    tiktokUrl: z.url(),
    youtubeUrl: z.url(),
    acceptedPaymentMethods: z.array(SanityImageSchema),
  }),
  gameFormats: z.array(
    z.strictObject({
      name: z.string().min(1),
      slug: z.string().min(1),
    }),
  ),
});

export const SanityVenueFooterSchema = z.strictObject({
  siteSettings: z.strictObject({
    facebookUrl: z.url(),
    footerLogo: SanityImageSchema,
    instagramUrl: z.url(),
    linkedinUrl: z.url(),
    tiktokUrl: z.url(),
    youtubeUrl: z.url(),
    acceptedPaymentMethods: z.array(SanityImageSchema),
  }),
  venue: z.strictObject({
    title: z.string(),
    fridayOpeningHours: z.string(),
    mondayOpeningHours: z.string(),
    saturdayOpeningHours: z.string(),
    sundayOpeningHours: z.string(),
    thursdayOpeningHours: z.string(),
    tuesdayOpeningHours: z.string(),
    wednesdayOpeningHours: z.string(),
    mail: z.email(),
    phone: z.string(),
    googleMapsLink: z.string().nullable(),
    offerings: z.array(
      z.strictObject({
        game: z.strictObject({
          name: z.string(),
          slug: z.string(),
        }),
      }),
    ),
  }),
});

export const SanityVenuesSlugSchema = z.array(
  z.strictObject({ slug: z.string() }),
);

export const SanityHeaderSchema = z.strictObject({
  siteSettings: z.strictObject({
    headerLogo: SanityImageSchema,
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
