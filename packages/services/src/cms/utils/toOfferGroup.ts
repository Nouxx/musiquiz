import type { SanityOfferGroup } from "@repo/api/sanity/shared/pageComponents";

import type { OfferGroup } from "../pageComponent.types";
import { toOfferCard } from "./toOfferCard";
import { toRichText } from "./toRichText";

export function toOfferGroup(group: SanityOfferGroup): OfferGroup {
  return {
    title: group.title,
    body: toRichText(group.body),
    tone: group.tone,
    cards: group.cards.map((card) => toOfferCard(card)),
  };
}
