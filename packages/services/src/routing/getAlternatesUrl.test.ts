import { expect, it } from "vitest";

import { getAlternatesUrl } from "./getAlternatesUrl";

const site = new URL("https://musiquiz.co");

it("pairs a static route with its english twin", () => {
  expect(getAlternatesUrl(site, (routes) => routes.contact)).toEqual({
    fr: "https://musiquiz.co/contact/",
    en: "https://musiquiz.co/en/contact/",
  });
});

it("passes the same params to both languages", () => {
  expect(
    getAlternatesUrl(site, (routes) => routes.venueGame("paris", "pixel-games")),
  ).toEqual({
    fr: "https://musiquiz.co/paris/jeux/pixel-games/",
    en: "https://musiquiz.co/en/paris/games/pixel-games/",
  });
});

it("rejects the blog at compile time", () => {
  // @ts-expect-error the blog is French only
  getAlternatesUrl(site, (routes) => routes.blog);
});

it("resolves against the site it is given", () => {
  expect(
    getAlternatesUrl(new URL("https://preview.example/"), (routes) =>
      routes.venueHome("lille"),
    ),
  ).toEqual({
    fr: "https://preview.example/lille/",
    en: "https://preview.example/en/lille/",
  });
});
