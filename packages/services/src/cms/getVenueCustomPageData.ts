import {
  fetchVenueCustomPage,
  type SanityVenueCustomPage,
} from "@repo/api/sanity/venueCustomPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenueCustomPage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";
import { toSeo } from "./utils/toSeo";

function adaptVenueCustomPage({
  data,
  lang,
}: {
  data: SanityVenueCustomPage;
  lang: Lang;
}): VenueCustomPage {
  return {
    venueTitle: data.venueCustomPage.venueTitle,
    title: data.venueCustomPage.title,
    pageCover: toPageCover({ data: data.venueCustomPage.pageCover }),
    seo: toSeo({
      data: data.venueCustomPage.seo,
      fallback: {
        title: data.venueCustomPage.title,
        description: data.venueCustomPage.pageCover.subHeading,
      },
    }),
    components:
      data.venueCustomPage.pageComponents?.map((component) =>
        adaptPageComponent({ data: component, lang }),
      ) ?? [],
  };
}

export async function getVenueCustomPageData({
  venueSlug,
  pageSlug,
  lang,
  config,
}: {
  venueSlug: string;
  pageSlug: string;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchVenueCustomPage({
    config,
    lang,
    venueSlug,
    pageSlug,
  });

  return adaptVenueCustomPage({ data, lang });
}
