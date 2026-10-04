import {
  fetchLegalNoticePage,
  type SanityLegalNoticePage,
} from "@repo/api/sanity/legalNoticePage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { LegalNoticePage } from "./types";
import { toPageCover } from "./utils/toPageCover";
import { toRichText } from "./utils/toRichText";
import { toSeo } from "./utils/toSeo";

function adaptLegalNoticePage({
  data,
}: {
  data: SanityLegalNoticePage;
}): LegalNoticePage {
  return {
    pageCover: toPageCover({ data: data.page.pageCover }),
    seo: toSeo({
      data: data.page.seo,
      fallback: {
        title: data.page.pageCover.heading,
        description: data.page.pageCover.subHeading,
      },
    }),
    body: toRichText(data.page.body),
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
