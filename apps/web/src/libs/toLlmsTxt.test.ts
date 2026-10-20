import type { LlmsTxt } from "@repo/services/cms/types";
import { expect, it } from "vitest";

import { toLlmsTxt } from "./toLlmsTxt";

const site = new URL("https://musiquiz.co");

const data: LlmsTxt = {
  summary: "Musi'Quiz est un jeu de quiz musical\nen équipe.",
  venues: [
    {
      name: "Lille",
      description: "Quiz immersif à Lille.",
      fr: "/lille/",
      en: "/en/lille/",
    },
  ],
  games: [
    {
      name: "Le Maillon Faible",
      description: undefined,
      fr: "/jeux/le-maillon-faible/",
      en: "/en/games/le-maillon-faible/",
    },
  ],
  events: [],
  articles: [
    {
      name: "5 idées de sortie entre collègues à Lille",
      description: "Nos cinq adresses lilloises.",
      fr: "/blog/5-idees-sortie-collegues-lille/",
    },
  ],
  pages: [
    { route: "contact", fr: "/contact/", en: "/en/contact/" },
    { route: "legalNotice", fr: "/mentions-legales/", en: "/en/legal-notice/" },
  ],
};

it("writes the llms.txt sections, skipping empty ones", () => {
  expect(toLlmsTxt(site, data)).toBe(`# Musi'Quiz

> Musi'Quiz est un jeu de quiz musical en équipe.

## Salles

- [Musi'Quiz Lille](https://musiquiz.co/lille/): Quiz immersif à Lille.

## Jeux

- [Le Maillon Faible](https://musiquiz.co/jeux/le-maillon-faible/)

## Pratique

- [Contact](https://musiquiz.co/contact/)

## Blog

- [5 idées de sortie entre collègues à Lille](https://musiquiz.co/blog/5-idees-sortie-collegues-lille/): Nos cinq adresses lilloises.

## English

- [Musi'Quiz Lille](https://musiquiz.co/en/lille/)
- [Le Maillon Faible](https://musiquiz.co/en/games/le-maillon-faible/)
- [Contact](https://musiquiz.co/en/contact/)

## Optional

- [Mentions légales](https://musiquiz.co/mentions-legales/)
`);
});

it("leaves the summary out until the client writes one", () => {
  expect(toLlmsTxt(site, { ...data, summary: undefined })).not.toMatch(/^> /m);
});
