import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";

function venueFooterQuery({
  lang,
  venueSlug,
}: {
  lang: Lang;
  venueSlug: string;
}) {
  return defineQuery(`{
    "siteSettings": *[_type == "siteSettings"][0]{
      footerLogo ${imageProjection({ lang })},
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      tiktokUrl,
      youtubeUrl,
      "acceptedPaymentMethods": acceptedPaymentMethods[] ${imageProjection({ lang })}
    },
    "venue": *[_type == "venue" && slug.current == "${venueSlug}"][0]{
      title,
      mondayOpeningHours,
      tuesdayOpeningHours,
      wednesdayOpeningHours,
      thursdayOpeningHours,
      fridayOpeningHours,
      saturdayOpeningHours,
      sundayOpeningHours,
      mail,
      phone,
      googleMapsLink,
      "offerings": offerings[]{
        "game": game->{
          name,
          "slug": slug.current
        }
      }
    }
  }`);
}

const sanityVenueFooterSchema = z.strictObject({
  siteSettings: z.strictObject({
    facebookUrl: z.url(),
    footerLogo: sanityImageSchema,
    instagramUrl: z.url(),
    linkedinUrl: z.url(),
    tiktokUrl: z.url(),
    youtubeUrl: z.url(),
    acceptedPaymentMethods: z.array(sanityImageSchema),
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
    phone: z.string().min(1),
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

export type SanityVenueFooter = z.infer<typeof sanityVenueFooterSchema>;

export async function fetchVenueFooter({
  config,
  lang,
  venueSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
}) {
  return fetchSanityData({
    query: venueFooterQuery({ lang, venueSlug }),
    schema: sanityVenueFooterSchema,
    config,
  });
}
