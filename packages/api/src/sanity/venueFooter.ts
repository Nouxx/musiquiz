import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";
import {
  openHoursProjection,
  sanityOpenHoursSchema,
} from "./shared/openingHours";

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
      "openHours": ${openHoursProjection},
      mail,
      phone,
      googleMapsLink,
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      tiktokUrl,
      youtubeUrl,
      "games": *[_type == "venueGame" && venue._ref == ^._id]
        | order(coalesce(game->displayOrder, 999) asc, game->name asc){
        "name": game->name,
        "slug": game->slug.current
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
    openHours: sanityOpenHoursSchema,
    mail: z.email(),
    phone: z.string().min(1),
    googleMapsLink: z.string().nullable(),
    facebookUrl: z.url().nullable(),
    instagramUrl: z.url().nullable(),
    linkedinUrl: z.url().nullable(),
    tiktokUrl: z.url().nullable(),
    youtubeUrl: z.url().nullable(),
    games: z
      .array(
        z.strictObject({
          name: z.string(),
          slug: z.string(),
        }),
      )
      .min(1),
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
    queryName: "venueFooter",
    query: venueFooterQuery({ lang, venueSlug }),
    schema: sanityVenueFooterSchema,
    config,
    lang,
  });
}
