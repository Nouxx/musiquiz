import {
  fetchJoinTheNetworkPage,
  type SanityJoinTheNetworkPage,
} from "@repo/api/sanity/joinTheNetworkPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { JoinTheNetworkPage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";

function adaptJoinTheNetworkPage({
  data,
}: {
  data: SanityJoinTheNetworkPage;
}): JoinTheNetworkPage {
  return {
    pageCover: toPageCover({ data: data.page.pageCover }),
    components:
      data.page.pageComponents?.map((component) =>
        adaptPageComponent(component),
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

  return adaptJoinTheNetworkPage({ data });
}
