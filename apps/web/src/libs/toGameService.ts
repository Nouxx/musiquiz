import type {
  GamePrice,
  PricesGame,
} from "@repo/services/cms/pageComponent.types";

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

// a booked activity: not Product (merchant rules), not Game (a work, not an experience)
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
  return {
    "@type": "Service",
    "@id": id,
    url,
    name,
    ...(description && { description }),
    ...(image && { image }),
    provider: { "@id": providerId },
    ...(cities.length > 0 && {
      areaServed: cities.map((city) => ({ "@type": "City", name: city })),
    }),
    ...(pricedGame && {
      offers: pricedGame.prices.map((price) => toOffer(price, url)),
    }),
  };
}
