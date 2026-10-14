import { fetchVenueUrlGuide } from "@repo/api/sanity/venueUrlGuide";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { toVenueUrls } from "../routing/siteUrls";
import { getVenueEventSlugs } from "./getVenueEventSlugs";
import { getVenueGameSlugs } from "./getVenueGameSlugs";
import { getVenueSlugs } from "./getVenueSlugs";
import { getVenueWidgetSlugs } from "./getVenueWidgetSlugs";

export async function getVenueSiteUrls({ config }: { config: SanityConfig }) {
  const [
    venues,
    venueSlugs,
    bookingVenueSlugs,
    giftingVenueSlugs,
    venueGames,
    venueEvents,
  ] = await Promise.all([
    fetchVenueUrlGuide({ config }),
    getVenueSlugs({ config }),
    getVenueWidgetSlugs({ config, pageType: "book" }),
    getVenueWidgetSlugs({ config, pageType: "gift" }),
    getVenueGameSlugs({ config }),
    getVenueEventSlugs({ config }),
  ]);

  return toVenueUrls({
    venues: venues.map((venue) => ({
      name: venue.title,
      slug: venue.links.slug,
      booking: venue.links.booking,
      gifting: venue.links.gifting,
    })),
    venueSlugs,
    bookingVenueSlugs,
    giftingVenueSlugs,
    venueGames,
    venueEvents,
  });
}
