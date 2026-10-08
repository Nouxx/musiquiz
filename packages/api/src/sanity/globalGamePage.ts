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

function globalGamePageQuery({
  lang,
  gameSlug,
}: {
  lang: Lang;
  gameSlug: string;
}) {
  return defineQuery(`{
    "globalGame": *[_type == "globalGame"
      && game->slug.current == "${gameSlug}"][0]{
      "gameName": game->name,
      pageCover ${pageCoverProjection({ lang })},
      "seo": ${seoProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ field: "pageComponents", lang })},
    }
  }`);
}

const sanityGlobalGamePageSchema = z.strictObject({
  globalGame: z.strictObject({
    gameName: z.string().min(1),
    pageCover: sanityPageCoverSchema({ hasCta: false }),
    seo: sanitySeoSchema,
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityGlobalGamePage = z.infer<typeof sanityGlobalGamePageSchema>;

export async function fetchGlobalGamePage({
  config,
  lang,
  gameSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  gameSlug: string;
}) {
  return fetchSanityData({
    queryName: "globalGamePage",
    query: globalGamePageQuery({ lang, gameSlug }),
    schema: sanityGlobalGamePageSchema,
    config,
  });
}
