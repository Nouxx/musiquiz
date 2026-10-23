import { anchors, venueTermsAnchor } from "./anchors";
import { getRoutesForLang } from "./getRoutesForLang";

const frenchRoutes = getRoutesForLang("fr");
const englishRoutes = getRoutesForLang("en");

// faq and press have no page; blogPage is the index's pagination, never linked to
type UnlistedRoute = "faq" | "press" | "blogPage";

export type SiteUrlRoute = Exclude<keyof typeof frenchRoutes, UnlistedRoute>;

// the article anchor only skips the cover: not worth a link
export type SiteUrlAnchor =
  Exclude<keyof typeof anchors, "article"> | "venueTerms";

export type SiteUrl = {
  route: SiteUrlRoute;
  /** the dynamic part, set on a game, event or article url */
  slug?: string;
  /** set on a custom page, whose slug is not a name */
  title?: string;
  /** set on a url that jumps to a section of its page */
  anchor?: SiteUrlAnchor;
  /** set on a url that jumps to a block anchored in the CMS */
  customAnchor?: CustomAnchor;
  fr: string;
  /** missing on the blog, French only: docs/adr/0013 */
  en?: string;
};

export type PartnerLink = { kind: "booking" | "gifting"; url: string };

export type VenueUrls = {
  name: string;
  slug: string;
  urls: SiteUrl[];
  /** set in place of the booking or gifting page a partner site replaces */
  partnerLinks: PartnerLink[];
};

export type VenueUrlInput = {
  name: string;
  slug: string;
  booking: { provider: "4escape" } | { provider: "external"; url: string };
  gifting:
    | { provider: "4escape" }
    | { provider: "external"; url: string }
    | { provider: "none" };
};

export type PageKey = {
  route: SiteUrlRoute;
  venueSlug?: string;
  slug?: string;
};

export type CustomAnchor = {
  /** the page component's `_type` */
  component: string;
  id: string;
};

export type CustomAnchorPage = PageKey & { anchors: CustomAnchor[] };

function staticUrl(
  route: Exclude<SiteUrlRoute, "blog" | "blogArticle">,
): SiteUrl {
  const fr = frenchRoutes[route];
  const en = englishRoutes[route];

  if (typeof fr !== "string" || typeof en !== "string") {
    throw new TypeError(`${route} is not a static route`);
  }

  return { route, fr, en };
}

function withHash(url: SiteUrl, id: string): SiteUrl {
  const hashed: SiteUrl = { ...url, fr: `${url.fr}#${id}` };
  if (url.en) hashed.en = `${url.en}#${id}`;

  return hashed;
}

function anchoredUrl(url: SiteUrl, anchor: SiteUrlAnchor, id: string) {
  return { ...withHash(url, id), anchor };
}

function customAnchoredUrl(url: SiteUrl, customAnchor: CustomAnchor) {
  return { ...withHash(url, customAnchor.id), customAnchor };
}

function withAnchors({
  url,
  venueSlug,
  sectionAnchors = [],
  pricesPages,
  customAnchorPages,
}: {
  url: SiteUrl;
  venueSlug?: string;
  sectionAnchors?: Exclude<SiteUrlAnchor, "prices" | "venueTerms">[];
  pricesPages: PageKey[];
  customAnchorPages: CustomAnchorPage[];
}): SiteUrl[] {
  function isThisPage(page: PageKey) {
    return (
      page.route === url.route &&
      page.venueSlug === venueSlug &&
      page.slug === url.slug
    );
  }

  const hasPrices = pricesPages.some((page) => isThisPage(page));
  const customAnchors =
    customAnchorPages.find((page) => isThisPage(page))?.anchors ?? [];

  return [
    url,
    ...sectionAnchors.map((anchor) =>
      anchoredUrl(url, anchor, anchors[anchor]),
    ),
    ...(hasPrices ? [anchoredUrl(url, "prices", anchors.prices)] : []),
    ...customAnchors.map((anchor) => customAnchoredUrl(url, anchor)),
  ];
}

export function toGlobalUrls({
  gameSlugs,
  eventSlugs,
  pricesPages,
  customAnchorPages,
}: {
  gameSlugs: string[];
  eventSlugs: string[];
  pricesPages: PageKey[];
  customAnchorPages: CustomAnchorPage[];
}): SiteUrl[] {
  return [
    { url: staticUrl("home"), sectionAnchors: ["venuesMap" as const] },
    { url: staticUrl("book"), sectionAnchors: ["venuesMap" as const] },
    ...gameSlugs.map((slug) => ({
      url: {
        route: "game" as const,
        slug,
        fr: frenchRoutes.game(slug),
        en: englishRoutes.game(slug),
      },
    })),
    ...eventSlugs.map((slug) => ({
      url: {
        route: "event" as const,
        slug,
        fr: frenchRoutes.event(slug),
        en: englishRoutes.event(slug),
      },
    })),
    {
      url: staticUrl("whereToFindUs"),
      sectionAnchors: ["venuesMap" as const],
    },
    {
      url: staticUrl("joinTheNetwork"),
      sectionAnchors: ["venueOpeningForm" as const],
    },
    { url: staticUrl("contact"), sectionAnchors: ["venuesContact" as const] },
    { url: staticUrl("termsAndConditions") },
    { url: staticUrl("legalNotice") },
  ].flatMap((page) => withAnchors({ ...page, pricesPages, customAnchorPages }));
}

function toPartnerLinks(venue: VenueUrlInput): PartnerLink[] {
  const links: PartnerLink[] = [];

  if (venue.booking.provider === "external") {
    links.push({ kind: "booking", url: venue.booking.url });
  }
  if (venue.gifting.provider === "external") {
    links.push({ kind: "gifting", url: venue.gifting.url });
  }

  return links;
}

export function toVenueUrls({
  venues,
  venueSlugs,
  bookingVenueSlugs,
  giftingVenueSlugs,
  venueGames,
  venueEvents,
  venueCustomPages,
  pricesPages,
  customAnchorPages,
  termsVenueSlugs,
}: {
  venues: VenueUrlInput[];
  venueSlugs: string[];
  bookingVenueSlugs: string[];
  giftingVenueSlugs: string[];
  venueGames: { venueSlug: string; gameSlug: string }[];
  venueEvents: { venueSlug: string; eventSlug: string }[];
  venueCustomPages: { venueSlug: string; pageSlug: string; title: string }[];
  pricesPages: PageKey[];
  customAnchorPages: CustomAnchorPage[];
  termsVenueSlugs: string[];
}): VenueUrls[] {
  return venues
    .filter((venue) => venueSlugs.includes(venue.slug))
    .map((venue) => {
      const { slug } = venue;
      const pages: {
        url: SiteUrl;
        sectionAnchors?: ("booking" | "gifting")[];
      }[] = [
        {
          url: {
            route: "venueHome",
            fr: frenchRoutes.venueHome(slug),
            en: englishRoutes.venueHome(slug),
          },
        },
      ];

      if (bookingVenueSlugs.includes(slug)) {
        pages.push({
          url: {
            route: "venueBook",
            fr: frenchRoutes.venueBook(slug),
            en: englishRoutes.venueBook(slug),
          },
          sectionAnchors: ["booking"],
        });
      }
      if (giftingVenueSlugs.includes(slug)) {
        pages.push({
          url: {
            route: "venueGifting",
            fr: frenchRoutes.venueGifting(slug),
            en: englishRoutes.venueGifting(slug),
          },
          sectionAnchors: ["gifting"],
        });
      }

      pages.push(
        ...venueGames
          .filter((pair) => pair.venueSlug === slug)
          .map(({ gameSlug }) => ({
            url: {
              route: "venueGame" as const,
              slug: gameSlug,
              fr: frenchRoutes.venueGame(slug, gameSlug),
              en: englishRoutes.venueGame(slug, gameSlug),
            },
          })),
        ...venueEvents
          .filter((pair) => pair.venueSlug === slug)
          .map(({ eventSlug }) => ({
            url: {
              route: "venueEvent" as const,
              slug: eventSlug,
              fr: frenchRoutes.venueEvent(slug, eventSlug),
              en: englishRoutes.venueEvent(slug, eventSlug),
            },
          })),
        ...venueCustomPages
          .filter((page) => page.venueSlug === slug)
          .map(({ pageSlug, title }) => ({
            url: {
              route: "venueCustomPage" as const,
              slug: pageSlug,
              title,
              fr: frenchRoutes.venueCustomPage(slug, pageSlug),
              en: englishRoutes.venueCustomPage(slug, pageSlug),
            },
          })),
      );

      const urls = pages.flatMap((page) =>
        withAnchors({
          ...page,
          venueSlug: slug,
          pricesPages,
          customAnchorPages,
        }),
      );

      if (termsVenueSlugs.includes(slug)) {
        urls.push(
          anchoredUrl(
            staticUrl("termsAndConditions"),
            "venueTerms",
            venueTermsAnchor(slug),
          ),
        );
      }

      return {
        name: venue.name,
        slug,
        urls,
        partnerLinks: toPartnerLinks(venue),
      };
    });
}

export function toBlogUrls({
  articleSlugs,
}: {
  articleSlugs: string[];
}): SiteUrl[] {
  return [
    { route: "blog", fr: frenchRoutes.blog },
    ...articleSlugs.map((slug) => ({
      route: "blogArticle" as const,
      slug,
      fr: frenchRoutes.blogArticle(slug),
    })),
  ];
}
