import { expect, it } from "vitest";

import { toWebPage } from "./toWebPage";

const site = new URL("https://musiquiz.co");

const page = {
  site,
  type: "WebPage",
  url: "https://musiquiz.co/paris/jeux/pixel-games/",
  name: "Pixel Games · Musi'Quiz Paris",
  description: "Un blind test rétro.",
  lang: "fr",
  venueSlug: "paris",
  image: {
    url: "https://musiquiz.co/_astro/cover.jpg",
    width: 1200,
    height: 630,
  },
  hasBreadcrumb: true,
  updatedAt: "2026-10-18T21:04:12Z",
} as const;

it("links the page to the site, its venue and its breadcrumb", () => {
  expect(toWebPage(page)).toEqual({
    "@type": "WebPage",
    "@id": "https://musiquiz.co/paris/jeux/pixel-games/#webpage",
    url: "https://musiquiz.co/paris/jeux/pixel-games/",
    name: "Pixel Games · Musi'Quiz Paris",
    description: "Un blind test rétro.",
    inLanguage: "fr",
    isPartOf: { "@id": "https://musiquiz.co/#website" },
    about: { "@id": "https://musiquiz.co/paris/#business" },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: "https://musiquiz.co/_astro/cover.jpg",
      width: 1200,
      height: 630,
    },
    breadcrumb: {
      "@id": "https://musiquiz.co/paris/jeux/pixel-games/#breadcrumb",
    },
    dateModified: "2026-10-18T21:04:12Z",
  });
});

it("is about the organization outside a venue", () => {
  expect(toWebPage({ ...page, venueSlug: undefined })).toHaveProperty("about", {
    "@id": "https://musiquiz.co/#organization",
  });
});

it("points to the french venue id from an english page", () => {
  expect(
    toWebPage({
      ...page,
      url: "https://musiquiz.co/en/paris/games/pixel-games/",
      lang: "en",
    }),
  ).toHaveProperty("about", { "@id": "https://musiquiz.co/paris/#business" });
});

it("leaves out what the page does not have rather than setting it undefined", () => {
  const webPage = toWebPage({
    ...page,
    description: undefined,
    image: undefined,
    hasBreadcrumb: false,
    updatedAt: undefined,
  });

  for (const key of [
    "description",
    "primaryImageOfPage",
    "breadcrumb",
    "dateModified",
  ]) {
    expect(webPage).not.toHaveProperty(key);
  }
});
