import { describe, expect, it } from "vitest";

import { capitalizeFirstLetter } from "./capitalizeFirstLetter";

describe("capitalizeFirstLetter", () => {
  it("uppercases the first letter", () => {
    expect(capitalizeFirstLetter("paris")).toBe("Paris");
  });

  it("leaves the rest of the string untouched", () => {
    expect(capitalizeFirstLetter("saint-étienne")).toBe("Saint-étienne");
    expect(capitalizeFirstLetter("pARIS")).toBe("PARIS");
  });

  it("handles an accented first letter", () => {
    expect(capitalizeFirstLetter("évry")).toBe("Évry");
  });

  it("keeps an already capitalized string as is", () => {
    expect(capitalizeFirstLetter("Paris")).toBe("Paris");
  });

  it("returns an empty string unchanged", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });

  it("leaves a leading non-letter as is", () => {
    expect(capitalizeFirstLetter(" paris")).toBe(" paris");
    expect(capitalizeFirstLetter("75 paris")).toBe("75 paris");
  });
});
