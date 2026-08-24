import { expect, it } from "vitest";

import { toRichText } from "./toRichText";

function block(
  children: { text: string; marks: string[] }[],
  markDefs: { _key: string; href: string }[] = [],
) {
  return {
    _type: "block" as const,
    style: "normal" as const,
    children: children.map((child) => ({ _type: "span" as const, ...child })),
    markDefs,
  };
}

it("turns each block into a paragraph", () => {
  expect(
    toRichText([block([{ text: "Une salle privatisée.", marks: [] }])]),
  ).toEqual([
    {
      type: "paragraph",
      spans: [
        { text: "Une salle privatisée.", bold: undefined, href: undefined },
      ],
    },
  ]);
});

it("reads the strong decorator as bold", () => {
  const [paragraph] = toRichText([
    block([{ text: "personne n'est nul", marks: ["strong"] }]),
  ]);

  expect(paragraph?.spans[0]?.bold).toBe(true);
});

it("resolves a mark key against the block's markDefs", () => {
  const [paragraph] = toRichText([
    block(
      [{ text: "Réservez une partie", marks: ["a1b2"] }],
      [{ _key: "a1b2", href: "https://musiquiz.fr/reserver" }],
    ),
  ]);

  expect(paragraph?.spans[0]?.href).toBe("https://musiquiz.fr/reserver");
});

it("carries both marks on one span", () => {
  const [paragraph] = toRichText([
    block(
      [{ text: "Réservez", marks: ["strong", "a1b2"] }],
      [{ _key: "a1b2", href: "https://musiquiz.fr/reserver" }],
    ),
  ]);

  expect(paragraph?.spans[0]).toEqual({
    text: "Réservez",
    bold: true,
    href: "https://musiquiz.fr/reserver",
  });
});

it("leaves a span alone when a mark matches no markDef", () => {
  const [paragraph] = toRichText([
    block([{ text: "peut-être", marks: ["em"] }]),
  ]);

  expect(paragraph?.spans[0]).toEqual({
    text: "peut-être",
    bold: undefined,
    href: undefined,
  });
});
