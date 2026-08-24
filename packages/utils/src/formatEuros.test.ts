import { expect, it } from "vitest";

import { formatEuros } from "./formatEuros";

it("shows no decimals on a round amount", () => {
  expect(formatEuros(16, "fr")).toBe("16€");
  expect(formatEuros(16, "en")).toBe("16€");
});

it("shows both decimals on a half euro, rather than the one it is written with", () => {
  expect(formatEuros(21.5, "fr")).toBe("21,50€");
});

it("keeps two decimals", () => {
  expect(formatEuros(21.55, "fr")).toBe("21,55€");
});

it("separates the decimals the English way", () => {
  expect(formatEuros(21.5, "en")).toBe("21.50€");
});

// the schema allows two decimals, so anything below a cent is authoring noise
it("rounds away a third decimal", () => {
  expect(formatEuros(21.555, "fr")).toBe("21,56€");
});

// U+202F is the narrow no-break space French groups thousands with — a plain
// space would let a price wrap across two lines
it("groups thousands the French way", () => {
  expect(formatEuros(1200, "fr")).toBe("1\u{202F}200€");
});

it("groups thousands the English way", () => {
  expect(formatEuros(1200, "en")).toBe("1,200€");
});
