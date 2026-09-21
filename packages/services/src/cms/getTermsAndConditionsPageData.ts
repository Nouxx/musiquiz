import {
  fetchTermsAndConditionsPage,
  type SanityTermsAndConditionsPage,
} from "@repo/api/sanity/termsAndConditionsPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { TermsAndConditionsPage } from "./types";
import { toPageCover } from "./utils/toPageCover";
import { toRichText } from "./utils/toRichText";

function adaptTermsAndConditionsPage({
  data,
}: {
  data: SanityTermsAndConditionsPage;
}): TermsAndConditionsPage {
  return {
    pageCover: toPageCover({ data: data.page.pageCover }),
    intro: toRichText(data.page.intro),
    venues: data.venues.map((venue) => ({
      slug: venue.slug,
      title: venue.title,
      articles: venue.terms.map((article) => ({
        title: article.title,
        body: toRichText(article.body),
      })),
    })),
  };
}

export async function getTermsAndConditionsPageData({
  lang,
  config,
}: {
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchTermsAndConditionsPage({ config, lang });

  return adaptTermsAndConditionsPage({ data });
}
