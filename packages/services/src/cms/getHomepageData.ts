import { getSanityClient } from "@repo/api/sanity/client";
import { fetchHomepageData } from "@repo/api/sanity/fetchHomepage";
import { fetchVenuesData } from "@repo/api/sanity/fetchVenues";
import { type SanityHomepage, type SanityVenue } from "@repo/api/sanity/types";
import { type Lang } from "@repo/utils/lang";

import type { Homepage, Venue } from "./types";

function adaptVenue(data: SanityVenue): Venue {
  return {
    title: data.title,
    slug: data.slug,
  };
}

function adaptHomepage(
  data: SanityHomepage,
  venuesData: SanityVenue[],
): Homepage {
  const { logo, badge, heading } = data;
  return {
    logo,
    badgeLabel: badge,
    heading,
    venues: venuesData.map((venue) => adaptVenue(venue)),
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
  draft: boolean;
  token?: string;
}) {
  const sanityClient = getSanityClient({ projectId, dataset, draft, token });

  const homepageData = await fetchHomepageData({
    lang,
    sanityClient,
  });

  const venuesData = await fetchVenuesData({ lang, sanityClient });

  return adaptHomepage(homepageData, venuesData);
}
