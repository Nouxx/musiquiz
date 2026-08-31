import { getVenueEventSlugs } from "@repo/services/cms/getVenueEventSlugs";

import { getSanityConfigFromEnvironment } from "../libs/getSanityConfigFromEnvironment";

export async function getVenueEventsSlugParameters() {
  const sanityConfig = getSanityConfigFromEnvironment();

  const pairs = await getVenueEventSlugs({ config: sanityConfig });

  return pairs.map(({ venueSlug, eventSlug }) => ({
    params: { venue: venueSlug, event: eventSlug },
  }));
}
