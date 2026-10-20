import { fetchLlmsTxt, type SanityLlmsTxt } from "@repo/api/sanity/llmsTxt";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { SiteUrl } from "../routing/siteUrls";
import { getBlogSiteUrls } from "./getBlogSiteUrls";
import { getGlobalSiteUrls } from "./getGlobalSiteUrls";
import { getVenueSiteUrls } from "./getVenueSiteUrls";
import type { LlmsTxt, LlmsTxtLink, LlmsTxtPageRoute } from "./types";

type SanityLlmsTxtEntry = SanityLlmsTxt["venues"][number];

const pageRoutes = {
  globalBookingPage: "book",
  whereToFindUsPage: "whereToFindUs",
  joinTheNetworkPage: "joinTheNetwork",
  contactPage: "contact",
  termsAndConditionsPage: "termsAndConditions",
  legalNoticePage: "legalNotice",
} as const satisfies Record<
  SanityLlmsTxt["pages"][number]["type"],
  LlmsTxtPageRoute
>;

function isPageUrl(
  url: SiteUrl,
): url is SiteUrl & { route: LlmsTxtPageRoute; en: string } {
  return (
    (Object.values(pageRoutes) as string[]).includes(url.route) &&
    url.en !== undefined
  );
}

function toPages({
  urls,
  pages,
}: {
  urls: SiteUrl[];
  pages: SanityLlmsTxt["pages"];
}): LlmsTxt["pages"] {
  return urls.filter(isPageUrl).flatMap(({ route, fr, en }) => {
    const page = pages.find(({ type }) => pageRoutes[type] === route);

    if (!page) {
      throw new Error(`llms.txt: no page document for ${fr}`);
    }

    // a noindex page should not be mentioned in llms.txt
    if (page.noindex) return [];

    return [{ route, fr, en }];
  });
}

// the site urls decide which pages exist, the entries only describe them
function toLinks({
  urls,
  entries,
}: {
  urls: { slug: string; fr: string; en?: string }[];
  entries: SanityLlmsTxtEntry[];
}): LlmsTxtLink[] {
  return urls.flatMap((url) => {
    const entry = entries.find(({ slug }) => slug === url.slug);

    if (!entry) {
      throw new Error(`llms.txt: no page document for ${url.fr}`);
    }
    if (entry.noindex) return [];

    return [
      {
        name: entry.name,
        description:
          entry.description ?? entry.fallbackDescription ?? undefined,
        fr: url.fr,
        en: url.en,
      },
    ];
  });
}

function withSlug(urls: SiteUrl[], route: SiteUrl["route"]) {
  return urls.flatMap((url) =>
    url.route === route && url.slug !== undefined
      ? [{ slug: url.slug, fr: url.fr, en: url.en }]
      : [],
  );
}

export async function getLlmsTxtData({
  config,
}: {
  config: SanityConfig;
}): Promise<LlmsTxt> {
  const [data, globalUrls, venueUrls, blogUrls] = await Promise.all([
    fetchLlmsTxt({ config }),
    getGlobalSiteUrls({ config }),
    getVenueSiteUrls({ config }),
    getBlogSiteUrls({ config }),
  ]);

  const venueHomeUrls = venueUrls.flatMap(({ slug, urls }) =>
    urls
      .filter((url) => url.route === "venueHome")
      .map((url) => ({ slug, fr: url.fr, en: url.en })),
  );

  return {
    summary: data.summary ?? undefined,
    venues: toLinks({ urls: venueHomeUrls, entries: data.venues }),
    games: toLinks({ urls: withSlug(globalUrls, "game"), entries: data.games }),
    events: toLinks({
      urls: withSlug(globalUrls, "event"),
      entries: data.events,
    }),
    articles: toLinks({
      urls: withSlug(blogUrls, "blogArticle"),
      entries: data.articles,
    }),
    pages: toPages({ urls: globalUrls, pages: data.pages }),
  };
}
