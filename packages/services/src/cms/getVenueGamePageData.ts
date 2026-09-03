import {
  fetchVenueGamePage,
  type SanityVenueGamePage,
} from "@repo/api/sanity/venueGamePage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenueGamePage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";

function adaptVenueGamePage({
  data,
}: {
  data: SanityVenueGamePage;
}): VenueGamePage {
  return {
    gameName: data.venueGame.gameName,
    pageCover: toPageCover({ data: data.venueGame.pageCover }),
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
