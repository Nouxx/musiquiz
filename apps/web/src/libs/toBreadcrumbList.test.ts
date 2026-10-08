import { expect, it } from "vitest";

import { toBreadcrumbList } from "./toBreadcrumbList";

const site = new URL("https://musiquiz.co");

it("numbers the items from 1 and resolves their urls against the site", () => {
  expect(
    toBreadcrumbList(site, [
      { label: "Accueil", url: "/" },
      { label: "Paris", url: "/paris/" },
      { label: "Pixel Games" },
    ]),
  ).toEqual({
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://musiquiz.co/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Paris",
        item: "https://musiquiz.co/paris/",
      },
      { "@type": "ListItem", position: 3, name: "Pixel Games" },
    ],
  });
});

it("leaves `item` out of the current page rather than setting it undefined", () => {
  const [current] = toBreadcrumbList(site, [
    { label: "Pixel Games" },
  ]).itemListElement;

  expect(current).not.toHaveProperty("item");
});

it("keeps an absolute url untouched", () => {
  const [item] = toBreadcrumbList(site, [
    { label: "Canada", url: "https://musiquiz.ca/" },
  ]).itemListElement;

  expect(item).toHaveProperty("item", "https://musiquiz.ca/");
});
