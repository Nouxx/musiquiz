import {
  fetchJoinTheNetworkPage,
  type SanityJoinTheNetworkPage,
} from "@repo/api/sanity/joinTheNetworkPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { JoinTheNetworkPage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";
import { toSeo } from "./utils/toSeo";

function adaptJoinTheNetworkPage({
  data,
  lang,
}: {
  data: SanityJoinTheNetworkPage;
  lang: Lang;
}): JoinTheNetworkPage {
  return {
    pageCover: toPageCover({ data: data.page.pageCover }),
    seo: toSeo({
      data: data.page.seo,
      fallback: {
        title: data.page.pageCover.heading,
        description: data.page.pageCover.subHeading,
      },
    }),
    components:
      data.page.pageComponents?.map((component) =>
        adaptPageComponent({ data: component, lang }),
      ) ?? [],
  };
}

export async function getJoinTheNetworkPageData({
  lang,
  config,
}: {
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchJoinTheNetworkPage({ config, lang });

  return adaptJoinTheNetworkPage({ data, lang });
}
