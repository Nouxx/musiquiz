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

export type GlobalPageType =
  | "joinTheNetwork"
  | "legalNotice"
  | "termsAndConditions";

function hasCta(pageType: GlobalPageType) {
  return pageType === "joinTheNetwork";
}

function globalPageQuery({
  lang,
  pageType,
}: {
  lang: Lang;
  pageType: GlobalPageType;
}) {
  return defineQuery(`{
    "globalPage": *[_type == "globalPage" && pageType == "${pageType}"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ field: "pageComponents", lang })},
    }
  }`);
}

function sanityGlobalPageSchema({ pageType }: { pageType: GlobalPageType }) {
  return z.strictObject({
    globalPage: z.strictObject({
      pageCover: sanityPageCoverSchema({ hasCta: hasCta(pageType) }),
      pageComponents: z.array(sanityPageComponentSchema).nullable(),
    }),
  });
}

export type SanityGlobalPage = z.infer<
  ReturnType<typeof sanityGlobalPageSchema>
>;

export async function fetchGlobalPage({
  config,
  lang,
  pageType,
}: {
  config: SanityConfig;
  lang: Lang;
  pageType: GlobalPageType;
}) {
  return fetchSanityData({
    query: globalPageQuery({ lang, pageType }),
    schema: sanityGlobalPageSchema({ pageType }),
    config,
  });
}
