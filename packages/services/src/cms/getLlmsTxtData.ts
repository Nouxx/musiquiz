import { fetchLlmsTxt, type SanityLlmsTxt } from "@repo/api/sanity/llmsTxt";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { SiteUrl } from "../routing/siteUrls";
import { getBlogSiteUrls } from "./getBlogSiteUrls";
import { getGlobalSiteUrls } from "./getGlobalSiteUrls";
import { getVenueSiteUrls } from "./getVenueSiteUrls";
import type { LlmsTxt, LlmsTxtLink, LlmsTxtPageRoute } from "./types";

type SanityLlmsTxtEntry = SanityLlmsTxt["venues"][number];

const pageRoutes: LlmsTxtPageRoute[] = [
  "book",
  "whereToFindUs",
  "joinTheNetwork",
  "contact",
  "termsAndConditions",
  "legalNotice",
];

function isPageUrl(
  url: SiteUrl,
): url is SiteUrl & { route: LlmsTxtPageRoute; en: string } {
  return (pageRoutes as string[]).includes(url.route) && url.en !== undefined;
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
    pages: globalUrls
      .filter(isPageUrl)
      .map(({ route, fr, en }) => ({ route, fr, en })),
  };
}
