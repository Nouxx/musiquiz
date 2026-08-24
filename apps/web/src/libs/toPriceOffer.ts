import type {
  GamePrice,
  PricesGame,
} from "@repo/services/cms/pageComponent.types";
import type { PriceOffer, PriceTier } from "@repo/ui/types";
import { formatEuros } from "@repo/utils/formatEuros";
import type { Lang } from "@repo/utils/lang";

import type { getT } from "./i18n";

type Translate = ReturnType<typeof getT>;

function priceLabel(price: GamePrice, t: Translate) {
  const { playerCountFrom, playerCountTo } = price;

  if (playerCountFrom === undefined) return t("prices.unique");

  if (playerCountTo === undefined) {
    return t("prices.fromOnly", { count: playerCountFrom });
  }

  // "3 players", not "from 3 to 3 players"
  if (playerCountTo === playerCountFrom) {
    return t("prices.exact", { count: playerCountFrom });
  }

  return t("prices.range", { from: playerCountFrom, to: playerCountTo });
}

function priceIcon(price: GamePrice) {
  return price.playerCountFrom === undefined ? "coins" : "users-2";
}

function toPriceTier({
  price,
  t,
  lang,
}: {
  price: GamePrice;
  t: Translate;
  lang: Lang;
}): PriceTier {
  return {
    label: priceLabel(price, t),
    icon: priceIcon(price),
    amountWithCurrency: formatEuros(price.amount, lang),
    note: price.note,
  };
}

export function toPriceOffer({
  game,
  t,
  lang,
}: {
  game: PricesGame;
  t: Translate;
  lang: Lang;
}): PriceOffer {
  return {
    name: game.name,
    image: game.image,
    // the editor's order is the render order
    tiers: game.prices.map((price) => toPriceTier({ price, t, lang })),
  };
}
