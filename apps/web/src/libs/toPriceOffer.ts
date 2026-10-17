import type {
  GamePrice,
  PricesGame,
} from "@repo/services/cms/pageComponent.types";
import type { PriceOffer, PriceTier } from "@repo/ui/types";
import { formatPriceParts } from "@repo/utils/formatPrice";
import type { Lang } from "@repo/utils/lang";

function toPriceTier({
  price,
  lang,
}: {
  price: GamePrice;
  lang: Lang;
}): PriceTier {
  const { amount, unit } = formatPriceParts({
    amount: price.amount,
    lang,
    currency: price.currency,
  });

  return {
    label: price.label,
    labelIcon: price.icon,
    price: amount,
    currency: unit,
    caption: price.caption,
    note: price.note,
  };
}

export function toPriceOffer({
  game,
  lang,
}: {
  game: PricesGame;
  lang: Lang;
}): PriceOffer {
  return {
    name: game.name,
    image: game.image,
    // the editor's order is the render order
    tiers: game.prices.map((price) => toPriceTier({ price, lang })),
  };
}
