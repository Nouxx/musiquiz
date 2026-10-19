// a booked activity: not Product (merchant rules), not Game (a work, not an experience)
export function toService({
  id,
  url,
  name,
  serviceType,
  description,
  image,
  providerId,
  cities,
  offers,
}: {
  id: string;
  url: string;
  name: string;
  serviceType: string | undefined;
  description: string | undefined;
  image: string | undefined;
  providerId: string;
  cities: string[];
  /** the prices the page shows */
  offers: Record<string, unknown>[];
}) {
  return {
    "@type": "Service",
    "@id": id,
    url,
    name,
    ...(serviceType && { serviceType }),
    ...(description && { description }),
    ...(image && { image }),
    provider: { "@id": providerId },
    ...(cities.length > 0 && {
      areaServed: cities.map((city) => ({ "@type": "City", name: city })),
    }),
    ...(offers.length > 0 && { offers }),
  };
}
