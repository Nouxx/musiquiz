import type { SanityCard } from "@repo/api/sanity/shared/pageComponents";

import type { Card } from "../pageComponent.types";
import { toCmsImage } from "./toCmsImage";
import { toCta } from "./toCta";

export function toCard(card: SanityCard): Card {
  return {
    media: toCmsImage(card.media),
    badge: card.badge,
    title: card.title,
    body: card.body ?? undefined,
    cta: toCta(card.cta),
  };
}
