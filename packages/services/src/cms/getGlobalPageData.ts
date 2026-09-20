import {
  fetchGlobalPage,
  type SanityGlobalPage,
} from "@repo/api/sanity/globalPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { GlobalPage, GlobalPageType } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";

function adaptGlobalPage({
  data,
  pageType,
}: {
  data: SanityGlobalPage;
  pageType: GlobalPageType;
}): GlobalPage {
  switch (pageType) {
    case "joinTheNetwork":
    case "legalNotice":
    case "termsAndConditions": {
      return {
        pageCover: toPageCover({ data: data.globalPage.pageCover }),
        components:
          data.globalPage.pageComponents?.map((component) =>
            adaptPageComponent(component),
          ) ?? [],
      };
    }
  }
}

export async function getGlobalPageData({
  pageType,
  lang,
  config,
}: {
  pageType: GlobalPageType;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchGlobalPage({ config, lang, pageType });

  return adaptGlobalPage({ data, pageType });
}
