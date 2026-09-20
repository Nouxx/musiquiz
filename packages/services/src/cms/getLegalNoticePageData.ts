import {
  fetchLegalNoticePage,
  type SanityLegalNoticePage,
} from "@repo/api/sanity/legalNoticePage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { LegalNoticePage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";

function adaptLegalNoticePage({
  data,
}: {
  data: SanityLegalNoticePage;
}): LegalNoticePage {
  return {
    pageCover: toPageCover({ data: data.page.pageCover }),
    components:
      data.page.pageComponents?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
  };
}

export async function getLegalNoticePageData({
  lang,
  config,
}: {
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchLegalNoticePage({ config, lang });

  return adaptLegalNoticePage({ data });
}
