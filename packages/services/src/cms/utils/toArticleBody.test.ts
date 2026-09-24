import { expect, it } from "vitest";

import { toArticleBody } from "./toArticleBody";
import { toReadingMinutes } from "./toReadingMinutes";

function block(
  text: string,
  {
    style = "normal",
    bullet = false,
  }: { style?: "normal" | "h2" | "h3"; bullet?: boolean } = {},
) {
  return {
    _type: "block" as const,
    style,
    // eslint-disable-next-line unicorn/no-null -- GROQ projects a missing key as null
    listItem: bullet ? ("bullet" as const) : null,
    children: [{ _type: "span" as const, text, marks: [] }],
    markDefs: [],
  };
}

it("groups consecutive list items into one list", () => {
  const nodes = toArticleBody([
    block("Intro"),
    block("Un", { bullet: true }),
    block("Deux", { bullet: true }),
    block("Fin"),
  ]);

  expect(nodes.map((node) => node.type)).toEqual([
    "paragraph",
    "list",
    "paragraph",
  ]);
  expect(nodes[1]).toMatchObject({
    items: [[{ text: "Un" }], [{ text: "Deux" }]],
  });
});

it("reads h2 and h3 as heading levels", () => {
  const nodes = toArticleBody([
    block("Titre", { style: "h2" }),
    block("Sous-titre", { style: "h3" }),
  ]);

  expect(nodes).toMatchObject([
    { type: "heading", level: 2 },
    { type: "heading", level: 3 },
  ]);
});

function words(count: number) {
  return toArticleBody([block("mot ".repeat(count).trim())]);
}

it("rounds reading time up, one minute at least", () => {
  expect(toReadingMinutes(words(3))).toBe(1);
  expect(toReadingMinutes(words(201))).toBe(2);
});
