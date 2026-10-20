import type { SanityPricedGame } from "@repo/api/sanity/shared/pageComponents";
import type { Currency } from "@repo/utils/currency";

import type { PricesGame } from "../pageComponent.types";
import { toCmsImage } from "./toCmsImage";

export function toPricesGame({
  game,
  currency,
}: {
  game: SanityPricedGame;
  currency: Currency;
}): PricesGame {
  return {
    slug: game.slug,
    name: game.name,
    image: toCmsImage(game.image),
    prices: game.prices.map((price) => ({
      label: price.label,
      icon: price.icon,
      amount: price.amount,
      currency,
      caption: price.caption,
      note: price.note ?? undefined,
    })),
  };
}
