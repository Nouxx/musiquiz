import { getGlobalEventSlugs } from "@repo/services/cms/getGlobalEventSlugs";

import { getSanityConfigFromEnvironment } from "../libs/getSanityConfigFromEnvironment";

export async function getGlobalEventsSlugParameters() {
  const slugs = await getGlobalEventSlugs({
    config: getSanityConfigFromEnvironment(),
  });

  return slugs.map((event) => ({ params: { event } }));
}
