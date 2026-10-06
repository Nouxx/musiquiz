import { fetchGlobalGameSlugs } from "@repo/api/sanity/globalGameSlugs";
import type { SanityConfig } from "@repo/utils/sanityConfig";

export async function getGlobalGameSlugs({ config }: { config: SanityConfig }) {
  return fetchGlobalGameSlugs({ config });
}
