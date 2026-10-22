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
    block([{ text: "peut-être", marks: ["c3d4"] }]),
  ]);

  expect(paragraph?.spans[0]).toEqual({
    text: "peut-être",
    bold: undefined,
    href: undefined,
  });
});

it("reads the em, underline and strike-through decorators", () => {
  const [paragraph] = toRichText([
    block([
      { text: "25€", marks: ["strike-through"] },
      { text: " 20€", marks: ["em", "underline"] },
    ]),
  ]);

  expect(paragraph?.spans).toMatchObject([
    { strike: true, italic: undefined, underline: undefined },
    { strike: undefined, italic: true, underline: true },
  ]);
});

it("collapses a run of line breaks into one", () => {
  const [paragraph] = toRichText([
    block([{ text: "Le jour J.\n \n\nChaque salle", marks: [] }]),
  ]);

  expect(paragraph?.spans[0]?.text).toBe("Le jour J.\nChaque salle");
});

it("drops line breaks at the edges of a paragraph", () => {
  const [paragraph] = toRichText([
    block([
      { text: "\nRéservez\n", marks: [] },
      { text: "\nmaintenant\n", marks: ["strong"] },
    ]),
  ]);

  expect(paragraph?.spans.map((span) => span.text)).toEqual([
    "Réservez\n",
    "\nmaintenant",
  ]);
});
