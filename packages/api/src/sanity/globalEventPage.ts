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

function globalEventPageQuery({
  lang,
  eventSlug,
}: {
  lang: Lang;
  eventSlug: string;
}) {
  return defineQuery(`{
    "globalEvent": *[_type == "globalEvent"
      && event->slug.current == "${eventSlug}"][0]{
      "eventName": event->name,
      pageCover ${pageCoverProjection({ lang })},
      "seo": ${seoProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ field: "pageComponents", lang })},
    }
  }`);
}

const sanityGlobalEventPageSchema = z.strictObject({
  globalEvent: z.strictObject({
    eventName: z.string().min(1),
    pageCover: sanityPageCoverSchema({ hasCta: false }),
    seo: sanitySeoSchema,
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityGlobalEventPage = z.infer<typeof sanityGlobalEventPageSchema>;

export async function fetchGlobalEventPage({
  config,
  lang,
  eventSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  eventSlug: string;
}) {
  return fetchSanityData({
    queryName: "globalEventPage",
    query: globalEventPageQuery({ lang, eventSlug }),
    schema: sanityGlobalEventPageSchema,
    config,
  });
}
