import {
  fetchLegalNoticePage,
  type SanityLegalNoticePage,
} from "@repo/api/sanity/legalNoticePage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { LegalNoticePage } from "./types";
import { toPageCover } from "./utils/toPageCover";
import { toRichText } from "./utils/toRichText";

function adaptLegalNoticePage({
  data,
}: {
  data: SanityLegalNoticePage;
}): LegalNoticePage {
  return {
    pageCover: toPageCover({ data: data.page.pageCover }),
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
