import type { SanityKeywordCard } from "@repo/api/sanity/shared/pageComponents";

import type { KeywordCard } from "../pageComponent.types";

export function toKeywordCard(card: SanityKeywordCard): KeywordCard {
  return {
    badge: card.badge,
    icon: card.icon,
    body: card.body,
  };
}
