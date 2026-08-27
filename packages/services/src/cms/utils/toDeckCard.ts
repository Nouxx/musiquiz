import type { SanityDeckCard } from "@repo/api/sanity/shared/pageComponents";

import type { DeckCard } from "../pageComponent.types";
import { toCmsImage } from "./toCmsImage";
import { toRichText } from "./toRichText";

export function toDeckCard(card: SanityDeckCard): DeckCard {
  return {
    media: toCmsImage(card.media),
    title: card.title,
    body: toRichText(card.body),
  };
}
