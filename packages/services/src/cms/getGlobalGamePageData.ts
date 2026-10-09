import {
  fetchGlobalGamePage,
  type SanityGlobalGamePage,
} from "@repo/api/sanity/globalGamePage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { GlobalGamePage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";
import { toSeo } from "./utils/toSeo";

function adaptGlobalGamePage({
  data,
  lang,
}: {
  data: SanityGlobalGamePage;
  lang: Lang;
}): GlobalGamePage {
  return {
    gameName: data.globalGame.gameName,
    pageCover: toPageCover({ data: data.globalGame.pageCover }),
    seo: toSeo({
      data: data.globalGame.seo,
      fallback: {
        title: data.globalGame.pageCover.heading,
        description: data.globalGame.pageCover.subHeading,
      },
    }),
    components:
      data.globalGame.pageComponents?.map((component) =>
        adaptPageComponent({ data: component, lang }),
      ) ?? [],
  };
}

export async function getGlobalGamePageData({
  gameSlug,
  lang,
  config,
}: {
  gameSlug: string;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchGlobalGamePage({ config, lang, gameSlug });

  return adaptGlobalGamePage({ data, lang });
}
