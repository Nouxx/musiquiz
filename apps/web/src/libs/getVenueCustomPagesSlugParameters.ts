import { getVenueCustomPageSlugs } from "@repo/services/cms/getVenueCustomPageSlugs";

import { getSanityConfigFromEnvironment } from "../libs/getSanityConfigFromEnvironment";

export async function getVenueCustomPagesSlugParameters() {
  const sanityConfig = getSanityConfigFromEnvironment();

  const pages = await getVenueCustomPageSlugs({ config: sanityConfig });

  return pages.map(({ venueSlug, pageSlug }) => ({
    params: { venue: venueSlug, page: pageSlug },
  }));
}
