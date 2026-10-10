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
  switch (venue.booking.provider) {
    case "4escape": {
      return {
        url: getRoutesForLang(lang).venueBook(venue.slug),
        external: false,
      };
    }
    case "external": {
      return { url: venue.booking.url, external: true };
    }
  }
}

export function toGiftingLink({
  venue,
  lang,
}: {
  venue: SanityVenueLinks;
  lang: Lang;
}): VenueLink | undefined {
  switch (venue.gifting.provider) {
    case "4escape": {
      return {
        url: getRoutesForLang(lang).venueGifting(venue.slug),
        external: false,
      };
    }
    case "external": {
      return { url: venue.gifting.url, external: true };
    }
    case "none": {
      return undefined;
    }
  }
}
