import type {
  GamePrice,
  PricesGame,
} from "@repo/services/cms/pageComponent.types";

import { toService } from "./toService";

function toOffer(price: GamePrice, url: string) {
  return {
    "@type": "Offer",
    name: price.label,
    description: price.caption,
    price: price.amount,
    priceCurrency: price.currency,
    url,
  };
}

export function toGameService({
  id,
  url,
  name,
  description,
  image,
  providerId,
  cities,
  pricedGame,
}: {
  id: string;
  url: string;
  name: string;
  description: string | undefined;
  image: string | undefined;
  providerId: string;
  cities: string[];
  /** the prices the page shows, none on a global game page */
  pricedGame: PricesGame | undefined;
}) {
  return toService({
    id,
    url,
    name,
    serviceType: undefined,
    description,
    image,
    providerId,
    cities,
    offers: pricedGame?.prices.map((price) => toOffer(price, url)) ?? [],
  });
}
