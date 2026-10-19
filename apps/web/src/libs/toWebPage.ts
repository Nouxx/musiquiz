import type { Lang } from "@repo/utils/lang";

import { getOrganizationId } from "./getOrganizationId";
import { getVenueBusinessId } from "./getVenueBusinessId";
import { getWebsiteId } from "./getWebsiteId";
import { getBreadcrumbId } from "./toBreadcrumbList";

// CheckoutPage implies payment on the page; the booking widget is a partner's
export type WebPageType = "WebPage" | "ContactPage" | "CollectionPage";

export function toWebPage({
  site,
  type,
  url,
  name,
  description,
  lang,
  venueSlug,
  image,
  hasBreadcrumb,
  updatedAt,
}: {
  site: URL;
  type: WebPageType;
  url: string;
  name: string;
  description: string | undefined;
  lang: Lang;
  venueSlug: string | undefined;
  image: { url: string; width: number; height: number } | undefined;
  hasBreadcrumb: boolean;
  updatedAt: string | undefined;
}) {
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    ...(description && { description }),
    inLanguage: lang,
    isPartOf: { "@id": getWebsiteId(site) },
    about: {
      "@id": venueSlug
        ? getVenueBusinessId(site, venueSlug)
        : getOrganizationId(site),
    },
    ...(image && {
      primaryImageOfPage: { "@type": "ImageObject", ...image },
    }),
    ...(hasBreadcrumb && { breadcrumb: { "@id": getBreadcrumbId(url) } }),
    ...(updatedAt && { dateModified: updatedAt }),
  };
}
