import {
  fetchVenueHeader,
  type SanityVenueHeader,
} from "@repo/api/sanity/venueHeader";
import { getMailto } from "@repo/utils/getMailto";
import { getTel } from "@repo/utils/getTel";
import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { VenueHeader } from "./types";
import { toAddressLine } from "./utils/toAddressLine";
import { toCmsImage } from "./utils/toCmsImage";
import { toBookingLink, toGiftingLink } from "./utils/toVenueLinks";

function adaptVenueHeader({
  data,
  lang,
  venueSlug,
}: {
  data: SanityVenueHeader;
  lang: Lang;
  venueSlug: string;
}): VenueHeader {
  return {
    logo: toCmsImage(data.siteSettings.headerLogo),
    venue: {
      logo: toCmsImage(data.venue.venueLogoLight),
      address: toAddressLine(data.venue.address),
      mapsLink: data.venue.googleMapsLink,
      mailLabel: data.venue.mail,
      mailHref: getMailto(data.venue.mail),
      phoneLabel: data.venue.phone,
      phoneHref: getTel(data.venue.phone),
    },
    bookingLink: toBookingLink({ venue: data.venueLinks, lang }),
    giftingLink: toGiftingLink({ venue: data.venueLinks, lang }),
    experiences: data.venue.games.map((format) => ({
      label: format.name,
      url: getRoutesForLang(lang).venueGame(venueSlug, format.slug),
    })),
    events: data.venue.events.map((format) => ({
      label: format.name,
      url: getRoutesForLang(lang).venueEvent(venueSlug, format.slug),
    })),
    socials: {
      facebookUrl: data.siteSettings.facebookUrl,
      instagramUrl: data.siteSettings.instagramUrl,
      linkedinUrl: data.siteSettings.linkedinUrl,
      tiktokUrl: data.siteSettings.tiktokUrl,
      youtubeUrl: data.siteSettings.youtubeUrl,
    },
  };
}

export async function getVenueHeaderData({
  config,
  lang,
  venueSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
}) {
  const data = await fetchVenueHeader({ config, lang, venueSlug });

  return adaptVenueHeader({ data, lang, venueSlug });
}
