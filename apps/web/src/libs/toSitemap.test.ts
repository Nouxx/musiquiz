import { expect, it } from "vitest";

import { toSitemap } from "./toSitemap";

const site = new URL("https://musiquiz.co");

it("lists both languages of a page, each with its alternates", () => {
  const xml = toSitemap(site, [
    {
      fr: "/paris/",
      en: "/en/paris/",
      lastmod: "2026-10-18T20:45:31Z",
    },
  ]);

  const alternates = [
    '<xhtml:link rel="alternate" hreflang="fr" href="https://musiquiz.co/paris/"/>',
    '<xhtml:link rel="alternate" hreflang="en" href="https://musiquiz.co/en/paris/"/>',
    '<xhtml:link rel="alternate" hreflang="x-default" href="https://musiquiz.co/paris/"/>',
  ].join("");

  expect(xml).toContain(
    `<url><loc>https://musiquiz.co/paris/</loc><lastmod>2026-10-18T20:45:31Z</lastmod>${alternates}</url>`,
  );
  expect(xml).toContain(
    `<url><loc>https://musiquiz.co/en/paris/</loc><lastmod>2026-10-18T20:45:31Z</lastmod>${alternates}</url>`,
  );
});

it("gives a French-only page no alternates", () => {
  const xml = toSitemap(site, [
    { fr: "/blog/un-article/", lastmod: "2026-10-01T08:00:00Z" },
  ]);

  expect(xml).toContain(
    "<url><loc>https://musiquiz.co/blog/un-article/</loc><lastmod>2026-10-01T08:00:00Z</lastmod></url>",
  );
  expect(xml).not.toContain("xhtml:link");
});

it("escapes the urls", () => {
  const xml = toSitemap(site, [
    { fr: "/blog/a&b/", lastmod: "2026-10-01T08:00:00Z" },
  ]);

  expect(xml).toContain("<loc>https://musiquiz.co/blog/a&amp;b/</loc>");
});
