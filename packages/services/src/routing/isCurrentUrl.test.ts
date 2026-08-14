import { expect, it } from "vitest";

import { isCurrentUrl } from "./isCurrentUrl";

it("matches the same path", () => {
  expect(isCurrentUrl("/paris/offrir", "/paris/offrir")).toBe(true);
});

it("does not match a different path", () => {
  expect(isCurrentUrl("/paris/offrir", "/paris/reserver")).toBe(false);
});

it.each([
  ["/paris/", "/paris"],
  ["/paris", "/paris/"],
  ["/paris/", "/paris/"],
])("ignores a trailing slash (%s vs %s)", (pathname, url) => {
  expect(isCurrentUrl(pathname, url)).toBe(true);
});

it("keeps the root path distinct", () => {
  expect(isCurrentUrl("/", "/")).toBe(true);
  expect(isCurrentUrl("/", "/paris")).toBe(false);
});

it("ignores a query string on either side", () => {
  expect(isCurrentUrl("/paris/reserver?date=12-05", "/paris/reserver")).toBe(
    true,
  );
  expect(isCurrentUrl("/paris/reserver", "/paris/reserver?date=12-05")).toBe(
    true,
  );
});

it("ignores a fragment on either side", () => {
  expect(isCurrentUrl("/paris/#venues", "/paris/")).toBe(true);
  expect(isCurrentUrl("/paris/", "/paris/#venues")).toBe(true);
});

it("never marks a placeholder link current", () => {
  expect(isCurrentUrl("/paris/", "#todo")).toBe(false);
  expect(isCurrentUrl("/paris/offrir", "#todo")).toBe(false);
});

it("separates the locales", () => {
  expect(isCurrentUrl("/en/paris/gift", "/paris/offrir")).toBe(false);
  expect(isCurrentUrl("/en/paris/gift", "/en/paris/gift")).toBe(true);
});

it("does not treat a parent path as current", () => {
  expect(isCurrentUrl("/paris/quiz-pop", "/paris/")).toBe(false);
});
