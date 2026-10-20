import type { FaqQuestion } from "@repo/services/cms/pageComponent.types";
import type { RichText } from "@repo/services/cms/types";

import { getWebPageId } from "./toWebPage";

function plainText(answer: RichText) {
  return answer
    .map((node) => node.spans.map((span) => span.text).join(""))
    .join("\n");
}

export function toFaqPage({
  pageUrl,
  questions,
}: {
  pageUrl: string;
  questions: FaqQuestion[];
}) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    isPartOf: { "@id": getWebPageId(pageUrl) },
    mainEntity: questions.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: plainText(entry.answer) },
    })),
  };
}
