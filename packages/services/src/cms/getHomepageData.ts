import { fetchSanityData } from "@repo/api/sanity/fetchData";
import { fetchHomepageQuery } from "@repo/api/sanity/queries";
import { SanityHomepageSchema } from "@repo/api/sanity/schema";
import { type SanityHomepage } from "@repo/api/sanity/types";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Homepage, Venue } from "./types";

function adaptVenue(data: SanityHomepage["venues"][number]): Venue {
  return {
    title: data.title,
    slug: data.slug,
  };
}

function adaptHomepage(data: SanityHomepage): Homepage {
  const { logo, badge, heading } = data.homepage;
  return {
    logo,
    badgeLabel: badge,
    heading,
    venues: data.venues.map((venue) => adaptVenue(venue)),
  };
}

export async function getHomepageData({
  lang,
  config,
}: {
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchSanityData({
    query: fetchHomepageQuery(lang),
    schema: SanityHomepageSchema,
    config,
  });

  return adaptHomepage(data);
}
