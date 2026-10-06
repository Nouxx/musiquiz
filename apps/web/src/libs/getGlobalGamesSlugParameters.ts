import { getGlobalGameSlugs } from "@repo/services/cms/getGlobalGameSlugs";

import { getSanityConfigFromEnvironment } from "../libs/getSanityConfigFromEnvironment";

export async function getGlobalGamesSlugParameters() {
  const slugs = await getGlobalGameSlugs({
    config: getSanityConfigFromEnvironment(),
  });

  return slugs.map((game) => ({ params: { game } }));
}
