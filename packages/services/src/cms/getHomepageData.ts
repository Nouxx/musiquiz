import { fetchSanityData } from "@repo/api/sanity/fetchData";
import { fetchHomepageQuery } from "@repo/api/sanity/queries";
import { SanityHomepageSchema } from "@repo/api/sanity/schema";
import { type SanityHomepage } from "@repo/api/sanity/types";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Homepage } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptVenue(
  data: SanityHomepage["venues"][number],
): Homepage["venues"][number] {
  return {
    title: data.title,
    slug: data.slug,
    detail: data.regionCode,
  };
}

function adaptHomepage(data: SanityHomepage): Homepage {
  const { badge, cover, heading, logo } = data.homepage;
  return {
    logo: toCmsImage(logo),
    cover: toCmsImage(cover),
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
