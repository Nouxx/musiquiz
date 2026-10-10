import { expect, it } from "vitest";

import { suggestTrailingSlash } from "./suggestTrailingSlash";

it.each([
  ["https://musiquiz.co/contact", "https://musiquiz.co/contact/"],
  ["https://musiquiz.co/paris/reserver", "https://musiquiz.co/paris/reserver/"],
  ["https://musiquiz.co/paris#prices", "https://musiquiz.co/paris/#prices"],
  ["https://musiquiz.co/blog?page=2", "https://musiquiz.co/blog/?page=2"],
  [
    "https://www.musiquiz.co/contact#form",
    "https://www.musiquiz.co/contact/#form",
  ],
  ["HTTPS://MUSIQUIZ.CO/Contact", "HTTPS://MUSIQUIZ.CO/Contact/"],
])("adds the missing slash to %s", (url, expected) => {
  expect(suggestTrailingSlash(url)).toBe(expected);
});

it.each([
  "https://musiquiz.co",
  "https://musiquiz.co/",
  "https://musiquiz.co?ref=mail",
  "https://musiquiz.co/contact/",
  "https://musiquiz.co/paris/#prices",
  "https://musiquiz.co/menu.pdf",
  "https://partner.example/book",
  "https://musiquiz.co.evil.example/contact",
  "/paris/reserver",
  "mailto:hello@musiquiz.co",
  "tel:0612345678",
])("leaves %s alone", (url) => {
  expect(suggestTrailingSlash(url)).toBeUndefined();
});
