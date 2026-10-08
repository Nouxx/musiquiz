import { getRoutesForLang } from "@repo/services/routing/getRoutesForLang";
import type { BreadcrumbItem } from "@repo/ui/types";
import type { Lang } from "@repo/utils/lang";

import { getT } from "./i18n";

export function getVenueBreadcrumbs(
  lang: Lang,
  venue: { slug: string; title: string },
  pageName: string,
): BreadcrumbItem[] {
  const routes = getRoutesForLang(lang);

  return [
    { label: getT(lang)("header.home"), url: routes.home },
    { label: venue.title, url: routes.venueHome(venue.slug) },
    { label: pageName },
  ];
}
