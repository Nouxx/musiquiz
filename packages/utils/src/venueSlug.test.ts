import { expect, it } from "vitest";

import { isVenueSlug, slugifyVenueTitle } from "./venueSlug";

it.each(["paris", "saint-etienne", "villeneuve-d-ascq", "paris-11e"])(
  "accepts %s",
  (value) => {
    expect(isVenueSlug(value)).toBe(true);
  },
);

it.each([
  "",
  "Paris",
  "-paris",
  "paris-",
  "la--reunion",
  "2paris",
  "saint_etienne",
  "saint-étienne",
  "villeneuve-d'ascq",
  "paris bastille",
  "paris\n",
  "a".repeat(41),
])("rejects %j", (value) => {
  expect(isVenueSlug(value)).toBe(false);
});

it.each([
  ["Paris", "paris"],
  ["Saint-Étienne", "saint-etienne"],
  ["Villeneuve-d'Ascq", "villeneuve-d-ascq"],
  ["La Réunion", "la-reunion"],
  ["  Paris -- Bastille  ", "paris-bastille"],
])("slugifies %j", (title, slug) => {
  expect(slugifyVenueTitle(title)).toBe(slug);
  expect(isVenueSlug(slug)).toBe(true);
});

it("cuts a long title without leaving a trailing hyphen", () => {
  const slug = slugifyVenueTitle(`${"a".repeat(39)} bcd`);

  expect(slug).toBe("a".repeat(39));
  expect(isVenueSlug(slug)).toBe(true);
});
