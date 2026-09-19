import {
  fetchWhereToFindUsPage,
  type SanityWhereToFindUsPage,
} from "@repo/api/sanity/whereToFindUsPage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { VenuePin, WhereToFindUsPage } from "./types";
import { adaptPageComponent } from "./utils/adaptPageComponent";
import { toPageCover } from "./utils/toPageCover";

function adaptVenue({
  data,
  lang,
}: {
  data: SanityWhereToFindUsPage["venues"][number];
  lang: Lang;
}): VenuePin {
  return {
    id: data.slug,
    title: data.title,
    url: getRoutesForLang(lang).venueHome(data.slug),
    detail: data.regionCode,
    position: data.mapPosition,
  };
}

function adaptWhereToFindUsPage({
  data,
  lang,
}: {
  data: SanityWhereToFindUsPage;
  lang: Lang;
}): WhereToFindUsPage {
  const { page, venues } = data;

  return {
    pageCover: toPageCover({ data: page.pageCover }),
    componentsBeforeMap:
      page.componentsBeforeMap?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
    venues: venues.map((venue) => adaptVenue({ data: venue, lang })),
    venuesCta: page.venuesCta ?? undefined,
    componentsAfterMap:
      page.componentsAfterMap?.map((component) =>
        adaptPageComponent(component),
      ) ?? [],
  };
}

export async function getWhereToFindUsPageData({
  lang,
  config,
}: {
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchWhereToFindUsPage({ config, lang });

  return adaptWhereToFindUsPage({ data, lang });
}
