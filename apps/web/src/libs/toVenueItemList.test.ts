import { expect, it } from "vitest";

import { toVenueItemList } from "./toVenueItemList";

const site = new URL("https://musiquiz.co");

it("lists each venue by its business id, with its address", () => {
  expect(
    toVenueItemList({
      site,
      pageUrl: "https://musiquiz.co/en/where-to-find-us/",
      venues: [
        {
          slug: "paris",
          address: {
            streetAddress: "12 rue de la Musique",
            postalCode: "75011",
            addressLocality: "Paris",
            addressCountry: "FR",
          },
        },
      ],
    }),
  ).toEqual({
    "@type": "ItemList",
    "@id": "https://musiquiz.co/en/where-to-find-us/#venues",
    isPartOf: { "@id": "https://musiquiz.co/en/where-to-find-us/#webpage" },
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "EntertainmentBusiness",
          "@id": "https://musiquiz.co/paris/#business",
          address: {
            "@type": "PostalAddress",
            streetAddress: "12 rue de la Musique",
            postalCode: "75011",
            addressLocality: "Paris",
            addressCountry: "FR",
          },
        },
      },
    ],
  });
});
