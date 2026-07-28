import { getSanityClient } from "@repo/api/sanity/client";
import { fetchVenuesData } from "@repo/api/sanity/fetchVenues";
import { type SanityVenue } from "@repo/api/sanity/types";
import { type Lang } from "@repo/utils/lang";

import type { Venue } from "./types";

function adaptVenue(data: SanityVenue): Venue {
  return {
    title: data.title,
  };
}

export async function getHomepageData({
  lang,
  projectId,
  dataset,
  draft,
  token,
}: {
  lang: Lang;
  projectId: string;
  dataset: string;
  draft?: boolean;
  token?: string;
}) {
  const sanityClient = getSanityClient({ projectId, dataset, draft, token });

  const venues = await fetchVenuesData({ lang, sanityClient });

  // todo: throw if empty array

  return { venues: venues.map((venue) => adaptVenue(venue)) };
}
