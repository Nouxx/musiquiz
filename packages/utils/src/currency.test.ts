import { expect, it } from "vitest";

import { currencyOf } from "./currency";

it("pays in francs in Switzerland", () => {
  expect(currencyOf("CH")).toBe("CHF");
});

it("pays in euros everywhere else", () => {
  expect(currencyOf("FR")).toBe("EUR");
  expect(currencyOf("BE")).toBe("EUR");
});
