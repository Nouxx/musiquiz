import { fetchSitemap, type SanitySitemap } from "@repo/api/sanity/sitemap";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { SiteUrl, SiteUrlRoute } from "../routing/siteUrls";
import { getBlogSiteUrls } from "./getBlogSiteUrls";
import { getGlobalSiteUrls } from "./getGlobalSiteUrls";
import { getVenueSiteUrls } from "./getVenueSiteUrls";
import type { SitemapEntry } from "./types";

type SanitySitemapEntry = { updatedAt: string; noindex: boolean };

const pageRoutes = {
  homepage: "home",
  globalBookingPage: "book",
  whereToFindUsPage: "whereToFindUs",
  joinTheNetworkPage: "joinTheNetwork",
  contactPage: "contact",
  termsAndConditionsPage: "termsAndConditions",
  legalNoticePage: "legalNotice",
  blogPage: "blog",
} as const satisfies Record<
  SanitySitemap["pages"][number]["type"],
  SiteUrlRoute
>;

const venuePageRoutes = {
  home: "venueHome",
  book: "venueBook",
  gift: "venueGifting",
} as const satisfies Record<
  SanitySitemap["venuePages"][number]["pageType"],
  SiteUrlRoute
>;

function toKey({
  route,
  venueSlug = "",
  slug = "",
}: {
  route: SiteUrlRoute;
  venueSlug?: string;
  slug?: string;
}) {
  return `${route}/${venueSlug}/${slug}`;
}

function toDocuments(data: SanitySitemap) {
  const documents = new Map<string, SanitySitemapEntry>();

  for (const page of data.pages) {
    documents.set(toKey({ route: pageRoutes[page.type] }), page);
  }
  for (const page of data.venuePages) {
    const route = venuePageRoutes[page.pageType];
    // the venue home renders the venue's own fields: hours, address, contact
    const updatedAt =
      page.pageType === "home" && page.venueUpdatedAt > page.updatedAt
        ? page.venueUpdatedAt
        : page.updatedAt;
    documents.set(toKey({ route, venueSlug: page.venueSlug }), {
      updatedAt,
      noindex: page.noindex,
    });
  }
  for (const [route, entries] of [
    ["venueGame", data.venueGames],
    ["venueEvent", data.venueEvents],
    ["venueCustomPage", data.venueCustomPages],
  ] as const) {
    for (const entry of entries)
      documents.set(toKey({ route, ...entry }), entry);
  }
  for (const [route, entries] of [
    ["game", data.games],
    ["event", data.events],
    ["blogArticle", data.articles],
  ] as const) {
    for (const entry of entries)
      documents.set(toKey({ route, ...entry }), entry);
  }

  return documents;
}

// the site urls decide which pages exist, the documents only date them
export async function getSitemapData({
  config,
}: {
  config: SanityConfig;
}): Promise<SitemapEntry[]> {
  const [data, globalUrls, venueUrls, blogUrls] = await Promise.all([
    fetchSitemap({ config }),
    getGlobalSiteUrls({ config }),
    getVenueSiteUrls({ config }),
    getBlogSiteUrls({ config }),
  ]);

  const documents = toDocuments(data);

  const urls: { url: SiteUrl; venueSlug?: string }[] = [
    ...globalUrls.map((url) => ({ url })),
    ...venueUrls.flatMap(({ slug, urls }) =>
      urls.map((url) => ({ url, venueSlug: slug })),
    ),
    ...blogUrls.map((url) => ({ url })),
  ];

  // an anchored url is its page again, with a fragment crawlers ignore
  return urls.flatMap(({ url, venueSlug }) => {
    if (url.anchor) return [];

    const document = documents.get(
      toKey({ route: url.route, venueSlug, slug: url.slug }),
    );

    if (!document) {
      throw new Error(`sitemap: no page document for ${url.fr}`);
    }
    if (document.noindex) return [];

    return [{ fr: url.fr, en: url.en, lastmod: document.updatedAt }];
  });
}
