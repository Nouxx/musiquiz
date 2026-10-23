import type { OfferCard } from "@repo/services/cms/pageComponent.types";
import { expect, it } from "vitest";

import { toEventService } from "./toEventService";

function card(title: string, price: OfferCard["price"]): OfferCard {
  return {
    icon: "users-4",
    title,
    subTitle: "De 4 à 72 joueurs",
    price,
    content: { kind: "list", intro: undefined, items: [] },
  };
}

const service: Parameters<typeof toEventService>[0] = {
  id: "https://musiquiz.co/paris/evenements/team-building/#service",
  url: "https://musiquiz.co/en/paris/events/team-building/",
  name: "Team building",
  description: "Un quiz musical pour votre équipe.",
  image: "https://musiquiz.co/_astro/cover.jpg",
  providerId: "https://musiquiz.co/paris/#business",
  cities: ["Paris"],
  offers: {
    type: "offers",
    anchor: undefined,
    title: "Nos offres",
    subTitle: undefined,
    background: "default",
    bookingLink: {
      url: "https://musiquiz.co/paris/reserver/",
      external: false,
    },
    cta: undefined,
    content: {
      layout: "cards",
      cards: [
        card("Team building", {
          quotation: false,
          amount: 28,
          currency: "EUR",
          label: "HT/joueur",
        }),
        card("Restauration", { quotation: true }),
        card("Privatisation", {
          quotation: false,
          amount: 1500,
          currency: "EUR",
          label: "/4 heures",
        }),
      ],
    },
  },
};

it("names the format as the service type and links it to its provider", () => {
  expect(toEventService(service)).toMatchObject({
    "@type": "Service",
    "@id": "https://musiquiz.co/paris/evenements/team-building/#service",
    serviceType: "Team building",
    provider: { "@id": "https://musiquiz.co/paris/#business" },
    areaServed: [{ "@type": "City", name: "Paris" }],
  });
});

it("prices the cards the page prices, per unit, and skips quotations", () => {
  expect(toEventService(service).offers).toEqual([
    {
      "@type": "Offer",
      name: "Team building",
      description: "De 4 à 72 joueurs",
      price: 28,
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: 28,
        priceCurrency: "EUR",
        unitText: "HT/joueur",
      },
      url: "https://musiquiz.co/en/paris/events/team-building/",
    },
    {
      "@type": "Offer",
      name: "Privatisation",
      description: "De 4 à 72 joueurs",
      price: 1500,
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: 1500,
        priceCurrency: "EUR",
        unitText: "4 heures",
      },
      url: "https://musiquiz.co/en/paris/events/team-building/",
    },
  ]);
});

it("reads the cards of both groups", () => {
  const [first, second] = [
    card("EVG", {
      quotation: false,
      amount: 30,
      currency: "EUR",
      label: undefined,
    }),
    card("EVJF", {
      quotation: false,
      amount: 32,
      currency: "EUR",
      label: undefined,
    }),
  ];

  const offers = toEventService({
    ...service,
    offers: {
      ...service.offers!,
      content: {
        layout: "groups",
        groups: [
          { title: "EVG", body: [], tone: "blue", cards: [first] },
          { title: "EVJF", body: [], tone: "red", cards: [second] },
        ],
      },
    },
  }).offers;

  expect(offers?.map((offer) => offer.name)).toEqual(["EVG", "EVJF"]);
  expect(offers?.[0]).not.toHaveProperty("priceSpecification");
});

it("leaves offers out when nothing is priced", () => {
  expect(toEventService({ ...service, offers: undefined })).not.toHaveProperty(
    "offers",
  );
});
