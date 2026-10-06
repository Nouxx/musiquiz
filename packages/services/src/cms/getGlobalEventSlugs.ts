import { fetchGlobalEventSlugs } from "@repo/api/sanity/globalEventSlugs";
import type { SanityConfig } from "@repo/utils/sanityConfig";

export async function getGlobalEventSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  return fetchGlobalEventSlugs({ config });
}
