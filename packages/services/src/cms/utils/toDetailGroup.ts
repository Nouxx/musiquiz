import type { SanityDetailGroup } from "@repo/api/sanity/shared/pageComponents";

import type { DetailGroup } from "../pageComponent.types";

export function toDetailGroup(group: SanityDetailGroup): DetailGroup {
  return {
    name: group.name,
    cards: group.cards.map((card) => ({
      mark: card.mark ?? undefined,
      title: card.title,
      intro: card.intro ?? undefined,
      highlight: card.highlight,
    })),
  };
}
