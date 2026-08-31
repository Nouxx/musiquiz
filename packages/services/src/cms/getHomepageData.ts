import { fetchHomepage, type SanityHomepage } from "@repo/api/sanity/homepage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { Homepage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toCmsImage } from "./utils/toCmsImage";

function adaptVenue({
  data,
  lang,
}: {
  data: SanityHomepage["venues"][number];
  lang: Lang;
}): Homepage["venues"][number] {
  return {
    id: data.slug,
    title: data.title,
    url: getRoutesForLang(lang).venueHome(data.slug),
    detail: data.regionCode,
    position: data.mapPosition,
  };
}

function adaptHomepage({
  data,
  lang,
}: {
  data: SanityHomepage;
  lang: Lang;
}): Homepage {
  const { badge, cover, heading, logo, venuesCta } = data.homepage;

  return {
    logo: toCmsImage(logo),
    cover: toCmsImage(cover),
    badgeLabel: badge,
    heading,
    venues: data.venues.map((venue) => adaptVenue({ data: venue, lang })),
    venuesCta: venuesCta ?? undefined,
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

  return adaptHomepage({ data, lang });
}
