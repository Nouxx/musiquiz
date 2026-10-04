import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { pageCoverProjection, sanityPageCoverSchema } from "./shared/pageCover";
import { richTextProjection, sanityRichTextSchema } from "./shared/richText";
import { sanitySeoSchema, seoProjection } from "./shared/seo";

function legalNoticePageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "page": *[_type == "legalNoticePage"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "seo": ${seoProjection({ lang })},
      "body": ${richTextProjection({ field: "body", lang })},
    }
  }`);
}

const sanityLegalNoticePageSchema = z.strictObject({
  page: z.strictObject({
    pageCover: sanityPageCoverSchema({ hasCta: false }),
    seo: sanitySeoSchema,
    body: sanityRichTextSchema,
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
    queryName: "legalNoticePage",
    query: legalNoticePageQuery({ lang }),
    schema: sanityLegalNoticePageSchema,
    config,
  });
}
