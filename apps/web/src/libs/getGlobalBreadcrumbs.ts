import { getRoutesForLang } from "@repo/services/routing/getRoutesForLang";
import type { BreadcrumbItem } from "@repo/ui/types";
import type { Lang } from "@repo/utils/lang";

import { getT } from "./i18n";

export function getGlobalBreadcrumbs(
  lang: Lang,
  pageName: string,
): BreadcrumbItem[] {
  return [
    { label: getT(lang)("header.home"), url: getRoutesForLang(lang).home },
    { label: pageName },
  ];
}
