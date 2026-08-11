import { getVenueSlugs } from "@repo/services/cms/getVenueSlugs";

import { getSanityConfigFromEnvironment } from "../libs/getSanityConfigFromEnvironment";

export async function getVenuesSlugParameters() {
  const sanityConfig = getSanityConfigFromEnvironment();

  const venueSlugs = await getVenueSlugs({
    config: sanityConfig,
  });

  return venueSlugs.map((slug) => ({ params: { venue: slug } }));
}
