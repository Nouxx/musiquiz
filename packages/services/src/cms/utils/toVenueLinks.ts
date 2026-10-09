import type { SanityVenueLinks } from "@repo/api/sanity/shared/venueLinks";
import type { Lang } from "@repo/utils/lang";

import { getRoutesForLang } from "../../routing/getRoutesForLang";
import type { VenueLink } from "../types";

export function toBookingLink({
  venue,
  lang,
}: {
  venue: SanityVenueLinks;
  lang: Lang;
}): VenueLink {
  if (venue.hostedByPartner) {
    return { url: venue.partnerBookingUrl, external: true };
  }

  return { url: getRoutesForLang(lang).venueBook(venue.slug), external: false };
}

export function toGiftingLink({
  venue,
  lang,
}: {
  venue: SanityVenueLinks;
  lang: Lang;
}): VenueLink | undefined {
  if (venue.hostedByPartner) {
    return venue.partnerGiftingUrl
      ? { url: venue.partnerGiftingUrl, external: true }
      : undefined;
  }

  return {
    url: getRoutesForLang(lang).venueGifting(venue.slug),
    external: false,
  };
}
