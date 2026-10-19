import type { PageComponent } from "@repo/services/cms/pageComponent.types";
import type { LocalBusiness } from "@repo/services/cms/types";
import { getRoutesForLang } from "@repo/services/routing/getRoutesForLang";
import { formatPrice } from "@repo/utils/formatPrice";
import type { Lang } from "@repo/utils/lang";

import { getOrganizationId } from "./getOrganizationId";
import { getVenueGameServiceId } from "./getServiceId";
import { getVenueBusinessId } from "./getVenueBusinessId";
import { toGameService } from "./toGameService";

type VenuePrices = Extract<PageComponent, { type: "venuePrices" }>;

function toPriceRange({
  priceRange: { lowest, highest },
  currency,
  lang,
}: {
  priceRange: NonNullable<LocalBusiness["priceRange"]>;
  currency: LocalBusiness["currency"];
  lang: Lang;
}) {
  const low = formatPrice({ amount: lowest, lang, currency });

  return lowest === highest
    ? low
    : `${low}–${formatPrice({ amount: highest, lang, currency })}`;
}

function toOfferCatalog({
  site,
  lang,
  venueSlug,
  city,
  prices,
}: {
  site: URL;
  lang: Lang;
  venueSlug: string;
  city: string;
  prices: VenuePrices;
}) {
  return {
    "@type": "OfferCatalog",
    name: prices.title,
    itemListElement: prices.games.map((game) =>
      toGameService({
        id: getVenueGameServiceId(site, venueSlug, game.slug),
        url: new URL(
          getRoutesForLang(lang).venueGame(venueSlug, game.slug),
          site,
        ).href,
        name: game.name,
        description: undefined,
        image: undefined,
        providerId: getVenueBusinessId(site, venueSlug),
        cities: [city],
        pricedGame: game,
      }),
    ),
  };
}

export function toVenueBusiness({
  site,
  lang,
  url,
  venueSlug,
  city,
  description,
  imageUrl,
  logoUrl,
  business,
  prices,
}: {
  site: URL;
  lang: Lang;
  url: string;
  venueSlug: string;
  /** @example "Paris" */
  city: string;
  description: string | undefined;
  imageUrl: string;
  logoUrl: string;
  business: LocalBusiness;
  prices: VenuePrices | undefined;
}) {
  return {
    "@type": "EntertainmentBusiness",
    "@id": getVenueBusinessId(site, venueSlug),
    name: `Musi'Quiz ${city}`,
    url,
    ...(description && { description }),
    image: imageUrl,
    logo: logoUrl,
    address: { "@type": "PostalAddress", ...business.address },
    geo: { "@type": "GeoCoordinates", ...business.geo },
    telephone: business.telephone,
    email: business.email,
    hasMap: business.mapUrl,
    sameAs: business.sameAs,
    openingHoursSpecification: business.openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.days,
      opens: hours.opens,
      closes: hours.closes,
    })),
    ...(business.priceRange && {
      priceRange: toPriceRange({
        priceRange: business.priceRange,
        currency: business.currency,
        lang,
      }),
    }),
    currenciesAccepted: business.currency,
    ...(prices && {
      hasOfferCatalog: toOfferCatalog({ site, lang, venueSlug, city, prices }),
    }),
    parentOrganization: { "@id": getOrganizationId(site) },
  };
}
