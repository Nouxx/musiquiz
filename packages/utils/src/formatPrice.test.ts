import { expect, it } from "vitest";

import { formatPrice, formatPriceParts } from "./formatPrice";

const euros = { currency: "EUR" } as const;
const francs = { currency: "CHF" } as const;

it("shows no decimals on a round amount", () => {
  expect(formatPrice({ amount: 16, lang: "fr", ...euros })).toBe("16€");
  expect(formatPrice({ amount: 16, lang: "en", ...euros })).toBe("16€");
});

it("shows both decimals on a half euro, rather than the one it is written with", () => {
  expect(formatPrice({ amount: 21.5, lang: "fr", ...euros })).toBe("21,50€");
});

it("keeps two decimals", () => {
  expect(formatPrice({ amount: 21.55, lang: "fr", ...euros })).toBe("21,55€");
});

it("separates the decimals the English way", () => {
  expect(formatPrice({ amount: 21.5, lang: "en", ...euros })).toBe("21.50€");
});

// the schema allows two decimals, so anything below a cent is authoring noise
it("rounds away a third decimal", () => {
  expect(formatPrice({ amount: 21.555, lang: "fr", ...euros })).toBe("21,56€");
});

// U+202F is the narrow no-break space French groups thousands with — a plain
// space would let a price wrap across two lines
it("groups thousands the French way", () => {
  expect(formatPrice({ amount: 1200, lang: "fr", ...euros })).toBe(
    "1\u{202F}200€",
  );
});

it("groups thousands the English way", () => {
  expect(formatPrice({ amount: 1200, lang: "en", ...euros })).toBe("1,200€");
});

// the separator follows the site language, not Swiss usage
it("writes francs after the amount, in the language's style", () => {
  expect(formatPrice({ amount: 16, lang: "fr", ...francs })).toBe(
    "16\u{00A0}CHF",
  );
  expect(formatPrice({ amount: 21.5, lang: "fr", ...francs })).toBe(
    "21,50\u{00A0}CHF",
  );
  expect(formatPrice({ amount: 21.5, lang: "en", ...francs })).toBe(
    "21.50\u{00A0}CHF",
  );
});

it("glues a symbol to the amount", () => {
  expect(formatPriceParts({ amount: 21.5, lang: "fr", ...euros })).toEqual({
    amount: "21,50€",
    unit: undefined,
  });
});

it("keeps a code apart, for the UI to draw as a unit", () => {
  expect(formatPriceParts({ amount: 21.5, lang: "fr", ...francs })).toEqual({
    amount: "21,50",
    unit: "CHF",
  });
});
