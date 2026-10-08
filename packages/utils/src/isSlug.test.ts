import { expect, it } from "vitest";

import { isSlug } from "./isSlug";

it.each(["lille", "musi-teens", "10-titres-les-plus-rates-blind-test", "2"])(
  "accepts %s",
  (value) => {
    expect(isSlug(value)).toBe(true);
  },
);

it.each([
  "",
  'x" || _type == "blogArticle',
  "Lille",
  "-lille",
  "lille/",
  "lille\n",
  "a".repeat(101),
])("rejects %j", (value) => {
  expect(isSlug(value)).toBe(false);
});
