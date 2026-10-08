import {
  fetchVenueEventPage,
  type SanityVenueEventPage,
} from "@repo/api/sanity/venueEventPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenueEventPage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";
import { toSeo } from "./utils/toSeo";

function adaptVenueEventPage({
  data,
}: {
  data: SanityVenueEventPage;
}): VenueEventPage {
  return {
    venueTitle: data.venueEvent.venueTitle,
    eventName: data.venueEvent.eventName,
    pageCover: toPageCover({ data: data.venueEvent.pageCover }),
    seo: toSeo({
      data: data.venueEvent.seo,
      fallback: {
        title: data.venueEvent.pageCover.heading,
        description: data.venueEvent.pageCover.subHeading,
      },
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

  return adaptVenueEventPage({ data });
}
