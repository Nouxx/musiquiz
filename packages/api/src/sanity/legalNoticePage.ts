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

function legalNoticePageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "page": *[_type == "legalNoticePage"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ field: "pageComponents", lang })},
    }
  }`);
}

const sanityLegalNoticePageSchema = z.strictObject({
  page: z.strictObject({
    pageCover: sanityPageCoverSchema({ hasCta: false }),
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityLegalNoticePage = z.infer<typeof sanityLegalNoticePageSchema>;

export async function fetchLegalNoticePage({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  return fetchSanityData({
    query: legalNoticePageQuery({ lang }),
    schema: sanityLegalNoticePageSchema,
    config,
  });
}
