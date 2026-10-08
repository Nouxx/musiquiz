import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { addressProjection, sanityAddressSchema } from "./shared/address";
import {
  pageComponentsProjection,
  sanityPageComponentSchema,
} from "./shared/pageComponents";
import { pageCoverProjection, sanityPageCoverSchema } from "./shared/pageCover";
import { sanitySeoSchema, seoProjection } from "./shared/seo";

function venuePageQuery({
  lang,
  venueSlug,
}: {
  lang: Lang;
  venueSlug: string;
}) {
  return defineQuery(`{
    "venuePage": *[_type == "venuePage"
      && venue->slug.current == "${venueSlug}"
      && pageType == "home"][0]{
      "venueTitle": venue->title,
      "venue": venue->{
        "address": ${addressProjection},
        "location": location{ lat, lng },
        phone,
        mail,
        googleMapsLink,
        facebookUrl,
        instagramUrl,
        linkedinUrl,
        tiktokUrl,
        youtubeUrl,
        mondayOpeningHours,
        tuesdayOpeningHours,
        wednesdayOpeningHours,
        thursdayOpeningHours,
        fridayOpeningHours,
        saturdayOpeningHours,
        sundayOpeningHours,
        "priceAmounts": *[_type == "venueGame" && venue._ref == ^._id].prices[].amount,
      },
      pageCover ${pageCoverProjection({ lang })},
      "seo": ${seoProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ field: "pageComponents", lang })},
    }
  }`);
}

const sanityVenuePageSchema = z.strictObject({
  venuePage: z.strictObject({
    venueTitle: z.string().min(1),
    venue: z.strictObject({
      address: sanityAddressSchema,
      location: z.strictObject({ lat: z.number(), lng: z.number() }),
      phone: z.string().min(1),
      mail: z.email(),
      googleMapsLink: z.url(),
      facebookUrl: z.url().nullable(),
      instagramUrl: z.url().nullable(),
      linkedinUrl: z.url().nullable(),
      tiktokUrl: z.url().nullable(),
      youtubeUrl: z.url().nullable(),
      mondayOpeningHours: z.string(),
      tuesdayOpeningHours: z.string(),
      wednesdayOpeningHours: z.string(),
      thursdayOpeningHours: z.string(),
      fridayOpeningHours: z.string(),
      saturdayOpeningHours: z.string(),
      sundayOpeningHours: z.string(),
      priceAmounts: z.array(z.number()),
    }),
    pageCover: sanityPageCoverSchema({ hasCta: true }),
    seo: sanitySeoSchema,
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityVenuePage = z.infer<typeof sanityVenuePageSchema>;

export async function fetchVenuePage({
  config,
  lang,
  venueSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
}) {
  return fetchSanityData({
    queryName: "venuePage",
    query: venuePageQuery({ lang, venueSlug }),
    schema: sanityVenuePageSchema,
    config,
  });
}
