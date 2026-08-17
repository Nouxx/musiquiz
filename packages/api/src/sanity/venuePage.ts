import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";
import {
  pageComponentsProjection,
  sanityPageComponentSchema,
} from "./shared/pageComponents";

export type VenuePageType = "home" | "gift" | "book";

function venuePageQuery({
  lang,
  venueSlug,
  pageType,
}: {
  lang: Lang;
  venueSlug: string;
  pageType: VenuePageType;
}) {
  return defineQuery(`{
    "venuePage": *[_type == "venuePage"
      && venue->slug.current == "${venueSlug}"
      && pageType == "${pageType}"][0]{
      pageCover{
        media ${imageProjection({ lang })},
        "heading": heading[language == "${lang}"][0].value,
        "subHeading": subHeading[language == "${lang}"][0].value,
        "badge": badge[language == "${lang}"][0].value,
        "ctaLabel": ctaLabel[language == "${lang}"][0].value,
      },
      "pageComponents": ${pageComponentsProjection({ lang })},
    }
  }`);
}

const sanityVenuePageSchema = z.strictObject({
  venuePage: z.strictObject({
    pageCover: z.strictObject({
      media: sanityImageSchema,
      heading: z.string().min(1),
      subHeading: z.string().min(1).nullable(),
      badge: z.string().min(1).nullable(),
      ctaLabel: z.string().min(1),
    }),
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityVenuePage = z.infer<typeof sanityVenuePageSchema>;

export async function fetchVenuePage({
  config,
  lang,
  venueSlug,
  pageType,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
  pageType: VenuePageType;
}) {
  console.log("DEBUG", venuePageQuery({ lang, venueSlug, pageType }))
  return fetchSanityData({
    query: venuePageQuery({ lang, venueSlug, pageType }),
    schema: sanityVenuePageSchema,
    config,
  });
}
