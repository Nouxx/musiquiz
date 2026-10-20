import type {
  OfferCard,
  PageComponent,
} from "@repo/services/cms/pageComponent.types";

import { toService } from "./toService";

type Offers = Extract<PageComponent, { type: "offers" }>;

function toOffers(card: OfferCard, url: string) {
  // a quotation has no price to state
  if (card.price.quotation) return [];

  const unit = card.price.label?.replace(/^\//, "");

  return [
    {
      "@type": "Offer",
      name: card.title,
      ...(card.subTitle && { description: card.subTitle }),
      price: card.price.amount,
      priceCurrency: card.price.currency,
      // "HT/joueur", "/4 heures": the price is per something
      ...(unit && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: card.price.amount,
          priceCurrency: card.price.currency,
          unitText: unit,
        },
      }),
      url,
    },
  ];
}

function toCards(offers: Offers) {
  return offers.content.layout === "cards"
    ? offers.content.cards
    : offers.content.groups.flatMap((group) => group.cards);
}

// a format, not a dated happening: Event requires a startDate
export function toEventService({
  id,
  url,
  name,
  description,
  image,
  providerId,
  cities,
  offers,
}: {
  id: string;
  url: string;
  name: string;
  description: string | undefined;
  image: string | undefined;
  providerId: string;
  cities: string[];
  offers: Offers | undefined;
}) {
  return toService({
    id,
    url,
    name,
    serviceType: name,
    description,
    image,
    providerId,
    cities,
    offers: (offers ? toCards(offers) : []).flatMap((card) =>
      toOffers(card, url),
    ),
  });
}
