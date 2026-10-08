import {
  fetchGlobalEventPage,
  type SanityGlobalEventPage,
} from "@repo/api/sanity/globalEventPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { GlobalEventPage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";
import { toSeo } from "./utils/toSeo";

function adaptGlobalEventPage({
  data,
}: {
  data: SanityGlobalEventPage;
}): GlobalEventPage {
  return {
    eventName: data.globalEvent.eventName,
    pageCover: toPageCover({ data: data.globalEvent.pageCover }),
    seo: toSeo({
      data: data.globalEvent.seo,
      fallback: {
        title: data.globalEvent.pageCover.heading,
        description: data.globalEvent.pageCover.subHeading,
      },
    }),
    components:
      data.globalEvent.pageComponents?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
  };
}

export async function getGlobalEventPageData({
  eventSlug,
  lang,
  config,
}: {
  eventSlug: string;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchGlobalEventPage({ config, lang, eventSlug });

  return adaptGlobalEventPage({ data });
}
