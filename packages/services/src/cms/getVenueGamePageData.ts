import {
  fetchVenueGamePage,
  type SanityVenueGamePage,
} from "@repo/api/sanity/venueGamePage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenueGamePage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";
import { toSeo } from "./utils/toSeo";

function adaptVenueGamePage({
  data,
}: {
  data: SanityVenueGamePage;
}): VenueGamePage {
  return {
    venueTitle: data.venueGame.venueTitle,
    gameName: data.venueGame.gameName,
    pageCover: toPageCover({ data: data.venueGame.pageCover }),
    seo: toSeo({
      data: data.venueGame.seo,
      fallback: {
        title: data.venueGame.pageCover.heading,
        description: data.venueGame.pageCover.subHeading,
      },
    }),
    components:
      data.venueGame.pageComponents?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
  };
}

export async function getVenueGamePageData({
  venueSlug,
  gameSlug,
  lang,
  config,
}: {
  venueSlug: string;
  gameSlug: string;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchVenueGamePage({ config, lang, venueSlug, gameSlug });

  return adaptVenueGamePage({ data });
}
