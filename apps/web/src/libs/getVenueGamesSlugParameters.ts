import { getVenueGameSlugs } from "@repo/services/cms/getVenueGameSlugs";

import { getSanityConfigFromEnvironment } from "../libs/getSanityConfigFromEnvironment";

export async function getVenueGamesSlugParameters() {
  const sanityConfig = getSanityConfigFromEnvironment();

  const pairs = await getVenueGameSlugs({ config: sanityConfig });

  return pairs.map(({ venueSlug, gameSlug }) => ({
    params: { venue: venueSlug, game: gameSlug },
  }));
}
