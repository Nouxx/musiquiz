import { fetchTracking, type SanityTracking } from "@repo/api/sanity/tracking";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Tracking } from "./types";

function adaptTracking(data: SanityTracking): Tracking {
  return {
    gtmIds: [data.globalGtmId, data.venueGtmId].filter(
      (id): id is string => id !== null,
    ),
  };
}

export async function getTrackingData({
  config,
  venueSlug,
}: {
  config: SanityConfig;
  venueSlug: string | undefined;
}) {
  const data = await fetchTracking({ config, venueSlug });

  return adaptTracking(data);
}
