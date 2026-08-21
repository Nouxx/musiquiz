import {
  fetchVenueGamePage,
  type SanityVenueGamePage,
} from "@repo/api/sanity/venueGamePage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { VenueGamePage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";

function adaptVenueGamePage({
  data,
  lang,
  venueSlug,
}: {
  data: SanityVenueGamePage;
  lang: Lang;
  venueSlug: string;
}): VenueGamePage {
  return {
    gameName: data.venueGame.gameName,
    pageCover: toPageCover({
      data: data.venueGame.pageCover,
      ctaUrl: getRoutesForLang(lang).venueBook(venueSlug),
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

  return adaptVenueGamePage({ data, lang, venueSlug });
}
