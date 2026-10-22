import { describe, expect, it } from "vitest";

import { frenchTypography } from "./frenchTypography";

const NNBSP = "\u{202F}";

describe("frenchTypography", () => {
  it("binds ? ! : ; to the preceding word", () => {
    expect(frenchTypography("près de chez vous !")).toBe(
      `près de chez vous${NNBSP}!`,
    );
    expect(frenchTypography("Prêt à jouer ?")).toBe(`Prêt à jouer${NNBSP}?`);
    expect(frenchTypography("le samedi : 14h")).toBe(`le samedi${NNBSP}: 14h`);
    expect(frenchTypography("un ; deux")).toBe(`un${NNBSP}; deux`);
  });

  it("binds guillemets to the quoted text", () => {
    expect(frenchTypography("« Musi'Quiz »")).toBe(
      `«${NNBSP}Musi'Quiz${NNBSP}»`,
    );
  });

  it("replaces an existing no-break space", () => {
    expect(frenchTypography("vous\u{A0}!")).toBe(`vous${NNBSP}!`);
  });

  it("never inserts a space", () => {
    expect(frenchTypography("Ready to play?")).toBe("Ready to play?");
    expect(frenchTypography("10:30")).toBe("10:30");
    expect(frenchTypography("https://musiquiz.fr/?a=1")).toBe(
      "https://musiquiz.fr/?a=1",
    );
  });

  it("handles every occurrence", () => {
    expect(frenchTypography("Quoi ? Où !")).toBe(
      `Quoi${NNBSP}? Où${NNBSP}!`,
    );
  });
});
