import type { SanityTextCard } from "@repo/api/sanity/shared/pageComponents";

import type { TextCard } from "../pageComponent.types";
import { toCmsImage } from "./toCmsImage";

export function toTextCard(card: SanityTextCard): TextCard {
  return {
    icon: card.icon,
    body: card.body,
    media: toCmsImage(card.media),
  };
}
