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

function joinTheNetworkPageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "page": *[_type == "joinTheNetworkPage"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ field: "pageComponents", lang })},
    }
  }`);
}

const sanityJoinTheNetworkPageSchema = z.strictObject({
  page: z.strictObject({
    pageCover: sanityPageCoverSchema({ hasCta: false }),
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityJoinTheNetworkPage = z.infer<
  typeof sanityJoinTheNetworkPageSchema
>;

export async function fetchJoinTheNetworkPage({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  return fetchSanityData({
    query: joinTheNetworkPageQuery({ lang }),
    schema: sanityJoinTheNetworkPageSchema,
    config,
  });
}
