import { z } from "zod";

export const SanityImageSchema = z.strictObject({
  url: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  mimeType: z.string().min(1),
  alt: z.string().min(1).nullable(),
});

const SanityRollingBannerSchema = z.strictObject({
  _type: z.literal("rollingBanner"),
  message: z.string().min(1),
});

const SanityDummyComponentSchema = z.strictObject({
  _type: z.literal("dummyComponent"),
  text: z.string().min(1),
});

export const SanityPageComponentSchema = z.discriminatedUnion("_type", [
  SanityRollingBannerSchema,
  SanityDummyComponentSchema,
]);

export const SanityVenueHomepageSchema = z.strictObject({
  pageCover: z.strictObject({
    pageCoverMedia: SanityImageSchema,
    pageCoverBadge: z.string().min(1).nullable(),
    pageCoverHeading: z.string().min(1),
    pageCoverSubHeading: z.string().min(1),
    pageCoverCtaLabel: z.string().min(1),
  }),
});



export const SanityVenuesSlugSchema = z.array(
  z.strictObject({ slug: z.string() }),
);
