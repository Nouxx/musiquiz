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

function venueGamePageQuery({
  lang,
  venueSlug,
  gameSlug,
}: {
  lang: Lang;
  venueSlug: string;
  gameSlug: string;
}) {
  return defineQuery(`{
    "venueGame": *[_type == "venueGame"
      && venue->slug.current == "${venueSlug}"
      && game->slug.current == "${gameSlug}"][0]{
      price,
      "gameName": game->name,
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

const sanityVenueGamePageSchema = z.strictObject({
  venueGame: z.strictObject({
    price: z.number().nonnegative(),
    gameName: z.string().min(1),
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

export type SanityVenueGamePage = z.infer<typeof sanityVenueGamePageSchema>;

export async function fetchVenueGamePage({
  config,
  lang,
  venueSlug,
  gameSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
  gameSlug: string;
}) {
  return fetchSanityData({
    query: venueGamePageQuery({ lang, venueSlug, gameSlug }),
    schema: sanityVenueGamePageSchema,
    config,
  });
}
