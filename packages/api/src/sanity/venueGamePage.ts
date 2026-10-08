import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import {
  pageComponentsProjection,
  sanityPageComponentSchema,
} from "./shared/pageComponents";
import { pageCoverProjection, sanityPageCoverSchema } from "./shared/pageCover";
import { sanitySeoSchema, seoProjection } from "./shared/seo";

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
      "venueTitle": venue->title,
      "gameName": game->name,
      pageCover ${pageCoverProjection({ lang })},
      "seo": ${seoProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ field: "pageComponents", lang })},
    }
  }`);
}

const sanityVenueGamePageSchema = z.strictObject({
  venueGame: z.strictObject({
    venueTitle: z.string().min(1),
    gameName: z.string().min(1),
    pageCover: sanityPageCoverSchema({ hasCta: true }),
    seo: sanitySeoSchema,
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
    queryName: "venueGamePage",
    query: venueGamePageQuery({ lang, venueSlug, gameSlug }),
    schema: sanityVenueGamePageSchema,
    config,
  });
}
