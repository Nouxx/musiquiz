import { describe, expect, it } from "vitest";

import { getRoutesForLang } from "./getRoutesForLang";
import {
  toBlogUrls,
  toGlobalUrls,
  toVenueUrls,
  type VenueUrlInput,
} from "./siteUrls";

const paris: VenueUrlInput = {
  name: "Paris",
  slug: "paris",
  booking: { provider: "4escape" },
  gifting: { provider: "4escape" },
};

const lyon: VenueUrlInput = {
  name: "Lyon",
  slug: "lyon",
  booking: { provider: "external", url: "https://partner.example/book" },
  gifting: { provider: "none" },
};

function venueUrls(venues: VenueUrlInput[] = [paris, lyon]) {
  return toVenueUrls({
    venues,
    venueSlugs: venues.map((venue) => venue.slug),
    bookingVenueSlugs: ["paris"],
    giftingVenueSlugs: ["paris"],
    venueGames: [
      { venueSlug: "paris", gameSlug: "blind-test" },
      { venueSlug: "lyon", gameSlug: "karaoke" },
    ],
    venueEvents: [{ venueSlug: "paris", eventSlug: "anniversaire" }],
    venueCustomPages: [
      { venueSlug: "paris", pageSlug: "noel", title: "Noël au quiz" },
    ],
    pricesPages: [
      { route: "venueGame", venueSlug: "paris", slug: "blind-test" },
    ],
    customAnchorPages: [
      {
        route: "venueGame",
        venueSlug: "paris",
        slug: "blind-test",
        anchors: [
          { component: "faq", id: "questions" },
          { component: "textBody", id: "regles" },
        ],
      },
    ],
    termsVenueSlugs: ["paris"],
  });
}

function allUrls() {
  return [
    ...toGlobalUrls({
      gameSlugs: ["blind-test"],
      eventSlugs: ["seminaire"],
      pricesPages: [],
      customAnchorPages: [
        { route: "home", anchors: [{ component: "faq", id: "faq" }] },
      ],
    }),
    ...venueUrls().flatMap((venue) => venue.urls),
    ...toBlogUrls({ articleSlugs: ["premier-article"] }),
  ];
}

it("lists every route that has a page", () => {
  const listed = new Set(allUrls().map((url) => url.route));
  const unlisted = new Set(["faq", "press", "blogPage"]);

  const expected = Object.keys(getRoutesForLang("fr")).filter(
    (route) => !unlisted.has(route),
  );

  expect(listed).toEqual(new Set(expected));
});

it("ends every path with a slash, before any anchor", () => {
  for (const url of allUrls()) {
    expect(url.fr).toMatch(/\/(#[\w-]+)?$/);
    if (url.en) expect(url.en).toMatch(/^\/en\/(.*\/)?(#[\w-]+)?$/);
  }
});

it("anchors French and English paths alike", () => {
  for (const url of allUrls()) {
    if ((!url.anchor && !url.customAnchor) || !url.en) continue;
    expect(url.fr.split("#", 2)[1]).toBe(url.en.split("#", 2)[1]);
  }
});

describe("toVenueUrls", () => {
  it("lists the booking and gifting pages of a 4escape venue", () => {
    const [parisUrls] = venueUrls([paris]);

    expect(parisUrls?.urls.map((url) => url.fr)).toEqual([
      "/paris/",
      "/paris/reserver/",
      "/paris/reserver/#booking",
      "/paris/offrir/",
      "/paris/offrir/#gifting",
      "/paris/jeux/blind-test/",
      "/paris/jeux/blind-test/#prices",
      "/paris/jeux/blind-test/#questions",
      "/paris/jeux/blind-test/#regles",
      "/paris/evenements/anniversaire/",
      "/paris/noel/",
      "/cgv/#paris",
    ]);
    expect(parisUrls?.partnerLinks).toEqual([]);
  });

  it("swaps a partner's booking page for its link", () => {
    const [lyonUrls] = venueUrls([lyon]);

    expect(lyonUrls?.urls.map((url) => url.route)).toEqual([
      "venueHome",
      "venueGame",
    ]);
    expect(lyonUrls?.partnerLinks).toEqual([
      { kind: "booking", url: "https://partner.example/book" },
    ]);
  });

  it("pairs the English path with English words", () => {
    const [parisUrls] = venueUrls([paris]);

    expect(parisUrls?.urls[1]).toEqual({
      route: "venueBook",
      fr: "/paris/reserver/",
      en: "/en/paris/book/",
    });
  });

  it("skips a venue the build does not publish", () => {
    const urls = toVenueUrls({
      venues: [paris],
      venueSlugs: [],
      bookingVenueSlugs: [],
      giftingVenueSlugs: [],
      venueGames: [],
      venueEvents: [],
      venueCustomPages: [],
      pricesPages: [],
      customAnchorPages: [],
      termsVenueSlugs: [],
    });

    expect(urls).toEqual([]);
  });
});

describe("toGlobalUrls", () => {
  it("anchors the prices of a page that has some, and only that page", () => {
    const urls = toGlobalUrls({
      gameSlugs: ["blind-test", "karaoke"],
      eventSlugs: [],
      pricesPages: [{ route: "game", slug: "karaoke" }],
      customAnchorPages: [],
    });

    expect(
      urls.filter((url) => url.anchor === "prices").map((url) => url.fr),
    ).toEqual(["/jeux/karaoke/#prices"]);
  });

  it("does not take a venue page's prices for a global page's", () => {
    const urls = toGlobalUrls({
      gameSlugs: ["blind-test"],
      eventSlugs: [],
      pricesPages: [{ route: "game", venueSlug: "paris", slug: "blind-test" }],
      customAnchorPages: [],
    });

    expect(urls.some((url) => url.anchor === "prices")).toBe(false);
  });

  it("anchors a CMS block on its page only, in both languages", () => {
    const urls = toGlobalUrls({
      gameSlugs: ["blind-test", "karaoke"],
      eventSlugs: [],
      pricesPages: [],
      customAnchorPages: [
        {
          route: "game",
          slug: "karaoke",
          anchors: [{ component: "faq", id: "questions" }],
        },
      ],
    });

    expect(urls.filter((url) => url.customAnchor)).toEqual([
      {
        route: "game",
        slug: "karaoke",
        customAnchor: { component: "faq", id: "questions" },
        fr: "/jeux/karaoke/#questions",
        en: "/en/games/karaoke/#questions",
      },
    ]);
  });
});

it("gives blog urls no English path", () => {
  const urls = toBlogUrls({ articleSlugs: ["premier-article"] });

  for (const url of urls) {
    expect(url.en).toBeUndefined();
  }
});
