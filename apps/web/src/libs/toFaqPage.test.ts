import { expect, it } from "vitest";

import { toFaqPage } from "./toFaqPage";

const pageUrl = "https://musiquiz.co/paris/jeux/pixel-games/";

it("states each question with its answer as plain text, one line per paragraph", () => {
  expect(
    toFaqPage({
      pageUrl,
      questions: [
        {
          question: "Combien de joueurs ?",
          answer: [
            {
              type: "paragraph",
              spans: [
                { text: "De 4 à " },
                { text: "12", bold: true },
                { text: "." },
              ],
            },
            {
              type: "paragraph",
              spans: [{ text: "Voir les tarifs", href: "/paris/reserver/" }],
            },
          ],
        },
      ],
    }),
  ).toEqual({
    "@type": "FAQPage",
    "@id": "https://musiquiz.co/paris/jeux/pixel-games/#faq",
    isPartOf: { "@id": "https://musiquiz.co/paris/jeux/pixel-games/#webpage" },
    mainEntity: [
      {
        "@type": "Question",
        name: "Combien de joueurs ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "De 4 à 12.\nVoir les tarifs",
        },
      },
    ],
  });
});
