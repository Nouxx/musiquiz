import { expect, it } from "vitest";

import { getReservedCustomPageSlugs } from "./getReservedCustomPageSlugs";

it("reserves the first segment of every venue route, in both languages", () => {
  expect(new Set(getReservedCustomPageSlugs())).toEqual(
    new Set([
      "reserver",
      "offrir",
      "jeux",
      "evenements",
      "book",
      "gift",
      "games",
      "events",
    ]),
  );
});
