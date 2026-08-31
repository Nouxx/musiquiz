import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";

function headerQuery({ lang, venueSlug }: { lang: Lang; venueSlug: string }) {
  return defineQuery(`{
    "siteSettings": *[_type == "siteSettings"][0]{
      headerLogo ${imageProjection({ lang })},
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      tiktokUrl,
      youtubeUrl,
    },
    "venue": *[_type == "venue" && slug.current == "${venueSlug}"][0]{
      "games": *[_type == "venueGame" && venue._ref == ^._id]
        | order(coalesce(game->displayOrder, 999) asc, game->name asc){
        "name": game->name,
        "slug": game->slug.current
      },
      "events": *[_type == "venueEvent" && venue._ref == ^._id]
        | order(coalesce(event->displayOrder, 999) asc, event->name asc){
        "name": event->name,
        "slug": event->slug.current
      },
      venueLogo ${imageProjection({ lang })},
      addressLine,
      phone,
      mail,
      googleMapsLink
    }
  }`);
}

const sanityHeaderSchema = z.strictObject({
  siteSettings: z.strictObject({
    headerLogo: sanityImageSchema,
    facebookUrl: z.url(),
    instagramUrl: z.url(),
    linkedinUrl: z.url(),
    tiktokUrl: z.url(),
    youtubeUrl: z.url(),
  }),
  venue: z.strictObject({
    games: z
      .array(
        z.strictObject({
          name: z.string(),
          slug: z.string(),
        }),
      )
      .min(1),
    events: z
      .array(
        z.strictObject({
          name: z.string(),
          slug: z.string(),
        }),
      )
      .min(1),
    venueLogo: sanityImageSchema,
    addressLine: z.string(),
    phone: z.string().min(1),
    mail: z.email(),
    googleMapsLink: z.string(),
  }),
});

export type SanityHeader = z.infer<typeof sanityHeaderSchema>;

export async function fetchHeader({
  config,
  lang,
  venueSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
}) {
  return fetchSanityData({
    query: headerQuery({ lang, venueSlug }),
    schema: sanityHeaderSchema,
    config,
  });
}
