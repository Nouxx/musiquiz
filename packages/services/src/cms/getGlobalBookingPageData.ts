import {
  fetchGlobalBookingPage,
  type SanityGlobalBookingPage,
} from "@repo/api/sanity/globalBookingPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { GlobalBookingPage, VenuePin } from "./types";
import { toPageCover } from "./utils/toPageCover";
import { toSeo } from "./utils/toSeo";
import { toBookingLink } from "./utils/toVenueLinks";

function adaptVenue({
  data,
  lang,
}: {
  data: SanityGlobalBookingPage["venues"][number];
  lang: Lang;
}): VenuePin {
  const booking = toBookingLink({ venue: data.links, lang });

  return {
    id: data.links.slug,
    title: data.title,
    url: booking.url,
    external: booking.external,
    detail: data.regionCode,
    position: data.mapPosition,
  };
}

function adaptGlobalBookingPage({
  data,
  lang,
}: {
  data: SanityGlobalBookingPage;
  lang: Lang;
}): GlobalBookingPage {
  const { page, venues } = data;

  return {
    pageCover: toPageCover({ data: page.pageCover }),
    seo: toSeo({
      data: page.seo,
      fallback: {
        title: page.pageCover.heading,
        description: page.pageCover.subHeading,
      },
    }),
    venues: venues.map((venue) => adaptVenue({ data: venue, lang })),
  };
}

export async function getGlobalBookingPageData({
  lang,
  config,
}: {
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchGlobalBookingPage({ config, lang });

  return adaptGlobalBookingPage({ data, lang });
}
