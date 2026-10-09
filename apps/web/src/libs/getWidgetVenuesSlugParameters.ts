import { getVenueWidgetSlugs } from "@repo/services/cms/getVenueWidgetSlugs";

import { getSanityConfigFromEnvironment } from "./getSanityConfigFromEnvironment";

export async function getWidgetVenuesSlugParameters() {
  const venueSlugs = await getVenueWidgetSlugs({
    config: getSanityConfigFromEnvironment(),
  });

  return venueSlugs.map((slug) => ({ params: { venue: slug } }));
}
