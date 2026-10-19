import { expect, it } from "vitest";

import { toVenueBusiness } from "./toVenueBusiness";

const site = new URL("https://musiquiz.co");

const venue: Parameters<typeof toVenueBusiness>[0] = {
  site,
  lang: "fr",
  url: "https://musiquiz.co/paris/",
  venueSlug: "paris",
  city: "Paris",
  description: "Blind tests en équipe.",
  imageUrl: "https://musiquiz.co/_astro/og.jpg",
  logoUrl: "https://musiquiz.co/_astro/logo.png",
  business: {
    logo: {
      url: "https://cdn.sanity.io/images/logo.png",
      width: 512,
      height: 512,
      mimeType: "image/png",
      alt: "",
    },
    address: {
      streetAddress: "12 rue de la Musique",
      postalCode: "75011",
      addressLocality: "Paris",
      addressCountry: "FR",
    },
    geo: { latitude: 48.86, longitude: 2.38 },
    telephone: "+33 1 23 45 67 89",
    email: "paris@musiquiz.co",
    mapUrl: "https://maps.google.com/?cid=1",
    sameAs: ["https://g.page/musiquiz-paris"],
    openingHours: [
      { days: ["Friday", "Saturday"], opens: "18:00", closes: "01:00" },
    ],
    priceRange: { lowest: 22, highest: 28 },
    currency: "EUR",
  },
  prices: {
    type: "venuePrices",
    title: "Nos tarifs",
    surface: "default",
    cta: undefined,
    footnote: undefined,
    bookingLink: { url: "/paris/reserver/", external: false },
    games: [
      {
        slug: "pixel-games",
        name: "Pixel Games",
        image: {
          url: "https://cdn.sanity.io/images/game.png",
          width: 800,
          height: 600,
          mimeType: "image/png",
          alt: "",
        },
        prices: [
          {
            label: "De 4 à 6 joueurs",
            icon: "users-4",
            amount: 28,
            currency: "EUR",
            caption: "par joueur",
            note: undefined,
          },
        ],
      },
    ],
  },
};

it("states the venue's facts, under the organization", () => {
  const business = toVenueBusiness(venue);

  expect(business).toMatchObject({
    "@type": "EntertainmentBusiness",
    "@id": "https://musiquiz.co/paris/#business",
    name: "Musi'Quiz Paris",
    address: { "@type": "PostalAddress", postalCode: "75011" },
    geo: { "@type": "GeoCoordinates", latitude: 48.86, longitude: 2.38 },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday", "Saturday"],
        opens: "18:00",
        closes: "01:00",
      },
    ],
    currenciesAccepted: "EUR",
    parentOrganization: { "@id": "https://musiquiz.co/#organization" },
  });
  expect(business.priceRange).toMatch(/^22.*–28/);
});

it("catalogs each priced game under its venue game service id", () => {
  expect(toVenueBusiness(venue).hasOfferCatalog).toMatchObject({
    "@type": "OfferCatalog",
    name: "Nos tarifs",
    itemListElement: [
      {
        "@type": "Service",
        "@id": "https://musiquiz.co/paris/jeux/pixel-games/#service",
        url: "https://musiquiz.co/paris/jeux/pixel-games/",
        provider: { "@id": "https://musiquiz.co/paris/#business" },
      },
    ],
  });
});

it("leaves out what the venue does not have rather than setting it undefined", () => {
  const bare = toVenueBusiness({
    ...venue,
    description: undefined,
    business: { ...venue.business, priceRange: undefined },
    prices: undefined,
  });

  for (const key of ["description", "priceRange", "hasOfferCatalog"]) {
    expect(bare).not.toHaveProperty(key);
  }
});
