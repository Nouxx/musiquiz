import { expect, it } from "vitest";

import { toBlog, toBlogItemList } from "./toBlog";

const site = new URL("https://musiquiz.co");

it("states one blog, published by the organization", () => {
  expect(
    toBlog({ site, name: "Le blog", description: "Nos articles." }),
  ).toEqual({
    "@type": "Blog",
    "@id": "https://musiquiz.co/blog/#blog",
    url: "https://musiquiz.co/blog/",
    name: "Le blog",
    description: "Nos articles.",
    inLanguage: "fr",
    publisher: { "@id": "https://musiquiz.co/#organization" },
  });
});

it("lists the articles a listing page shows, as absolute urls", () => {
  expect(
    toBlogItemList({
      site,
      pageUrl: "https://musiquiz.co/blog/page/2/",
      articleUrls: ["/blog/evjf-paris/", "/blog/team-building-lille/"],
    }),
  ).toEqual({
    "@type": "ItemList",
    "@id": "https://musiquiz.co/blog/page/2/#articles",
    isPartOf: { "@id": "https://musiquiz.co/blog/page/2/#webpage" },
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        url: "https://musiquiz.co/blog/evjf-paris/",
      },
      {
        "@type": "ListItem",
        position: 2,
        url: "https://musiquiz.co/blog/team-building-lille/",
      },
    ],
  });
});
