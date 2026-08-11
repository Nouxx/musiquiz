import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";

function venueHomepageQuery({
  lang,
  venueSlug,
}: {
  lang: Lang;
  venueSlug: string;
}) {
  return defineQuery(`{
    "pageCover": *[_type == "venue" && slug.current == "${venueSlug}"][0]{
      pageCoverMedia ${imageProjection({ lang })},
      "pageCoverHeading": pageCoverHeading[language == "${lang}"][0].value,
      "pageCoverSubHeading": pageCoverSubHeading[language == "${lang}"][0].value,
      "pageCoverBadge": pageCoverBadge[language == "${lang}"][0].value,
      "pageCoverCtaLabel": pageCoverCtaLabel[language == "${lang}"][0].value,
    }
  }`);
}

const sanityVenueHomepageSchema = z.strictObject({
  pageCover: z.strictObject({
    pageCoverMedia: sanityImageSchema,
    pageCoverBadge: z.string().min(1).nullable(),
    pageCoverHeading: z.string().min(1),
    pageCoverSubHeading: z.string().min(1),
    pageCoverCtaLabel: z.string().min(1),
  }),
});

export type SanityVenueHomepage = z.infer<typeof sanityVenueHomepageSchema>;

export async function fetchVenueHomepage({
  config,
  lang,
  venueSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
}) {
  return fetchSanityData({
    query: venueHomepageQuery({ lang, venueSlug }),
    schema: sanityVenueHomepageSchema,
    config,
  });
}
