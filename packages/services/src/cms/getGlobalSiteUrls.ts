import type { SanityConfig } from "@repo/utils/sanityConfig";

import { toGlobalUrls } from "../routing/siteUrls";
import { getGlobalEventSlugs } from "./getGlobalEventSlugs";
import { getGlobalGameSlugs } from "./getGlobalGameSlugs";
import { getSiteAnchors } from "./getSiteAnchors";

export async function getGlobalSiteUrls({ config }: { config: SanityConfig }) {
  const [gameSlugs, eventSlugs, { pricesPages }] = await Promise.all([
    getGlobalGameSlugs({ config }),
    getGlobalEventSlugs({ config }),
    getSiteAnchors({ config }),
  ]);

  return toGlobalUrls({ gameSlugs, eventSlugs, pricesPages });
}
