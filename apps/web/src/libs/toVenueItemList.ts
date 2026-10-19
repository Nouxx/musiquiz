import type { PostalAddress } from "@repo/services/cms/types";

import { getVenueBusinessId } from "./getVenueBusinessId";
import { getWebPageId } from "./toWebPage";

// name and url already come with the site graph's venue nodes
export function toVenueItemList({
  site,
  pageUrl,
  venues,
}: {
  site: URL;
  pageUrl: string;
  /** in the order the page lists them */
  venues: { slug: string; address: PostalAddress }[];
}) {
  return {
    "@type": "ItemList",
    "@id": `${pageUrl}#venues`,
    isPartOf: { "@id": getWebPageId(pageUrl) },
    itemListElement: venues.map(({ slug, address }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "EntertainmentBusiness",
        "@id": getVenueBusinessId(site, slug),
        address: { "@type": "PostalAddress", ...address },
      },
    })),
  };
}
