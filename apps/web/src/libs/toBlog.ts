import { getRoutesForLang } from "@repo/services/routing/getRoutesForLang";

import { getBlogId } from "./getBlogId";
import { getOrganizationId } from "./getOrganizationId";
import { getWebPageId } from "./toWebPage";

export function toBlog({
  site,
  name,
  description,
}: {
  site: URL;
  name: string;
  description: string | undefined;
}) {
  return {
    "@type": "Blog",
    "@id": getBlogId(site),
    url: new URL(getRoutesForLang("fr").blog, site).href,
    name,
    ...(description && { description }),
    inLanguage: "fr",
    publisher: { "@id": getOrganizationId(site) },
  };
}

export function toBlogItemList({
  site,
  pageUrl,
  articleUrls,
}: {
  site: URL;
  pageUrl: string;
  /** the articles this listing page shows, in order */
  articleUrls: string[];
}) {
  return {
    "@type": "ItemList",
    "@id": `${pageUrl}#articles`,
    isPartOf: { "@id": getWebPageId(pageUrl) },
    itemListElement: articleUrls.map((url, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: new URL(url, site).href,
    })),
  };
}
