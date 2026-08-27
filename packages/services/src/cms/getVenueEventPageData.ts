import {
  fetchVenueEventPage,
  type SanityVenueEventPage,
} from "@repo/api/sanity/venueEventPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { VenueEventPage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";

function adaptVenueEventPage({
  data,
  lang,
  venueSlug,
}: {
  data: SanityVenueEventPage;
  lang: Lang;
  venueSlug: string;
}): VenueEventPage {
  return {
    eventName: data.venueEvent.eventName,
    pageCover: toPageCover({
      data: data.venueEvent.pageCover,
      ctaUrl: getRoutesForLang(lang).venueBook(venueSlug),
    }),
    components:
      data.venueEvent.pageComponents?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
  };
}

export async function getVenueEventPageData({
  venueSlug,
  eventSlug,
  lang,
  config,
}: {
  venueSlug: string;
  eventSlug: string;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchVenueEventPage({
    config,
    lang,
    venueSlug,
    eventSlug,
  });

  return adaptVenueEventPage({ data, lang, venueSlug });
}
