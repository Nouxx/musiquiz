import { expect, it } from "vitest";

import { toGameService } from "./toGameService";

const service: Parameters<typeof toGameService>[0] = {
  id: "https://musiquiz.co/paris/jeux/pixel-games/#service",
  url: "https://musiquiz.co/en/paris/games/pixel-games/",
  name: "Pixel Games",
  description: "Un blind test rétro.",
  image: "https://musiquiz.co/_astro/cover.jpg",
  providerId: "https://musiquiz.co/paris/#business",
  cities: ["Paris"],
  pricedGame: {
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
};

it("links the service to its provider and prices it as the page does", () => {
  expect(toGameService(service)).toEqual({
    "@type": "Service",
    "@id": "https://musiquiz.co/paris/jeux/pixel-games/#service",
    url: "https://musiquiz.co/en/paris/games/pixel-games/",
    name: "Pixel Games",
    description: "Un blind test rétro.",
    image: "https://musiquiz.co/_astro/cover.jpg",
    provider: { "@id": "https://musiquiz.co/paris/#business" },
    areaServed: [{ "@type": "City", name: "Paris" }],
    offers: [
      {
        "@type": "Offer",
        name: "De 4 à 6 joueurs",
        description: "par joueur",
        price: 28,
        priceCurrency: "EUR",
        url: "https://musiquiz.co/en/paris/games/pixel-games/",
      },
    ],
  });
});

it("leaves out what the page does not have rather than setting it undefined", () => {
  const unpriced = toGameService({
    ...service,
    description: undefined,
    image: undefined,
    cities: [],
    pricedGame: undefined,
  });

  for (const key of ["description", "image", "areaServed", "offers"]) {
    expect(unpriced).not.toHaveProperty(key);
  }
});
