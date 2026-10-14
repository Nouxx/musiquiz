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
  });
}

function allUrls() {
  return [
    ...toGlobalUrls({ gameSlugs: ["blind-test"], eventSlugs: ["seminaire"] }),
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

it("ends every path with a slash", () => {
  for (const url of allUrls()) {
    expect(url.fr).toMatch(/\/$/);
    if (url.en) expect(url.en).toMatch(/^\/en\/(.*\/)?$/);
  }
});

describe("toVenueUrls", () => {
  it("lists the booking and gifting pages of a 4escape venue", () => {
    const [parisUrls] = venueUrls([paris]);

    expect(parisUrls?.urls.map((url) => url.fr)).toEqual([
      "/paris/",
      "/paris/reserver/",
      "/paris/offrir/",
      "/paris/jeux/blind-test/",
      "/paris/evenements/anniversaire/",
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
    });

    expect(urls).toEqual([]);
  });
});

it("gives blog urls no English path", () => {
  const urls = toBlogUrls({ articleSlugs: ["premier-article"] });

  for (const url of urls) {
    expect(url.en).toBeUndefined();
  }
});
