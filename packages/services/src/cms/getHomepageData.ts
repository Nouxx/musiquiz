import { fetchHomepage, type SanityHomepage } from "@repo/api/sanity/homepage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Homepage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
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
    components:
      data.homepage.pageComponents?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
  };
}

export async function getHomepageData({
  lang,
  config,
}: {
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchHomepage({ config, lang });

  return adaptHomepage(data);
}
