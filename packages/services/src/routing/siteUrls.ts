import { getRoutesForLang } from "./getRoutesForLang";

const frenchRoutes = getRoutesForLang("fr");
const englishRoutes = getRoutesForLang("en");

// faq and press have no page; blogPage is the index's pagination, never linked to
type UnlistedRoute = "faq" | "press" | "blogPage";

export type SiteUrlRoute = Exclude<keyof typeof frenchRoutes, UnlistedRoute>;

export type SiteUrl = {
  route: SiteUrlRoute;
  /** the dynamic part, set on a game, event or article url */
  slug?: string;
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

export function toGlobalUrls({
  gameSlugs,
  eventSlugs,
}: {
  gameSlugs: string[];
  eventSlugs: string[];
}): SiteUrl[] {
  return [
    staticUrl("home"),
    staticUrl("book"),
    ...gameSlugs.map((slug) => ({
      route: "game" as const,
      slug,
      fr: frenchRoutes.game(slug),
      en: englishRoutes.game(slug),
    })),
    ...eventSlugs.map((slug) => ({
      route: "event" as const,
      slug,
      fr: frenchRoutes.event(slug),
      en: englishRoutes.event(slug),
    })),
    staticUrl("whereToFindUs"),
    staticUrl("joinTheNetwork"),
    staticUrl("contact"),
    staticUrl("termsAndConditions"),
    staticUrl("legalNotice"),
  ];
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
}: {
  venues: VenueUrlInput[];
  venueSlugs: string[];
  bookingVenueSlugs: string[];
  giftingVenueSlugs: string[];
  venueGames: { venueSlug: string; gameSlug: string }[];
  venueEvents: { venueSlug: string; eventSlug: string }[];
}): VenueUrls[] {
  return venues
    .filter((venue) => venueSlugs.includes(venue.slug))
    .map((venue) => {
      const { slug } = venue;
      const urls: SiteUrl[] = [
        {
          route: "venueHome",
          fr: frenchRoutes.venueHome(slug),
          en: englishRoutes.venueHome(slug),
        },
      ];

      if (bookingVenueSlugs.includes(slug)) {
        urls.push({
          route: "venueBook",
          fr: frenchRoutes.venueBook(slug),
          en: englishRoutes.venueBook(slug),
        });
      }
      if (giftingVenueSlugs.includes(slug)) {
        urls.push({
          route: "venueGifting",
          fr: frenchRoutes.venueGifting(slug),
          en: englishRoutes.venueGifting(slug),
        });
      }

      urls.push(
        ...venueGames
          .filter((pair) => pair.venueSlug === slug)
          .map(({ gameSlug }) => ({
            route: "venueGame" as const,
            slug: gameSlug,
            fr: frenchRoutes.venueGame(slug, gameSlug),
            en: englishRoutes.venueGame(slug, gameSlug),
          })),
        ...venueEvents
          .filter((pair) => pair.venueSlug === slug)
          .map(({ eventSlug }) => ({
            route: "venueEvent" as const,
            slug: eventSlug,
            fr: frenchRoutes.venueEvent(slug, eventSlug),
            en: englishRoutes.venueEvent(slug, eventSlug),
          })),
      );

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
