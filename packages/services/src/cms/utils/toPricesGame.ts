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
    name: game.name,
    image: toCmsImage(game.image),
    prices: game.prices.map((price) => ({
      playerCountFrom: price.playerCountFrom ?? undefined,
      playerCountTo: price.playerCountTo ?? undefined,
      amount: price.amount,
      currency,
      note: price.note ?? undefined,
    })),
  };
}
