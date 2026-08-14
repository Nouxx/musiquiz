import { expect, it } from "vitest";

import { getTel } from "./getTel";

it("prefixes the scheme", () => {
  expect(getTel("0612345678")).toBe("tel:0612345678");
});

it("strips the spaces a French number is authored with", () => {
  expect(getTel("06 12 34 56 78")).toBe("tel:0612345678");
});

// U+00A0 is the non-breaking space a number carries when pasted from Word
it("strips the non-breaking spaces of a pasted number", () => {
  expect(getTel("06\u{A0}12\u{A0}34\u{A0}56\u{A0}78")).toBe("tel:0612345678");
});

it("keeps an international prefix", () => {
  expect(getTel("+33 6 12 34 56 78")).toBe("tel:+33612345678");
});

it.each([
  ["06-12-34-56-78", "tel:06-12-34-56-78"],
  ["06.12.34.56.78", "tel:06.12.34.56.78"],
  ["(0)6 12 34 56 78", "tel:(0)612345678"],
])("keeps the visual separators RFC 3966 allows (%s)", (phone, expected) => {
  expect(getTel(phone)).toBe(expected);
});

it("strips surrounding whitespace", () => {
  expect(getTel(" 0612345678 ")).toBe("tel:0612345678");
});
