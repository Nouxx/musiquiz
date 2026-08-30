import type { SanityOfferCard } from "@repo/api/sanity/shared/pageComponents";

import type { OfferCard } from "../pageComponent.types";
import { toRichText } from "./toRichText";

export function toOfferCard(card: SanityOfferCard): OfferCard {
  return {
    icon: card.icon,
    title: card.title,
    subTitle: card.subTitle ?? undefined,
    price: card.price.quotation
      ? { quotation: true }
      : {
          quotation: false,
          amount: card.price.amount,
          label: card.price.label ?? undefined,
        },
    content:
      card.content.kind === "list"
        ? {
            kind: "list",
            intro: card.content.intro ?? undefined,
            items: card.content.items.map((item) => item.text),
          }
        : { kind: "text", body: toRichText(card.content.body) },
  };
}
