import {
  fetchVenueFooter,
  type SanityVenueFooter,
} from "@repo/api/sanity/venueFooter";
import { getMailto } from "@repo/utils/getMailto";
import { getTel } from "@repo/utils/getTel";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { VenueFooter } from "./types";
import { toCmsImage } from "./utils/toCmsImage";
import { toDayHours } from "./utils/toDayHours";

function adaptVenueFooter({
  data,
  lang,
  venueSlug,
}: {
  data: SanityVenueFooter;
  lang: Lang;
  venueSlug: string;
}): VenueFooter {
  const { footerLogo, acceptedPaymentMethods } = data.siteSettings;

  const { title, openHours, games, mail, phone, googleMapsLink } = data.venue;

  return {
    logo: toCmsImage(footerLogo),
    // a venue's own account replaces the brand's on the same network
    socials: {
      facebookUrl: data.venue.facebookUrl ?? data.siteSettings.facebookUrl,
      instagramUrl: data.venue.instagramUrl ?? data.siteSettings.instagramUrl,
      linkedinUrl: data.venue.linkedinUrl ?? data.siteSettings.linkedinUrl,
      tiktokUrl: data.venue.tiktokUrl ?? data.siteSettings.tiktokUrl,
      youtubeUrl: data.venue.youtubeUrl ?? data.siteSettings.youtubeUrl,
    },
    newsletter: true,
    venueTitle: title,
    openHours: {
      monday: toDayHours(openHours.monday),
      tuesday: toDayHours(openHours.tuesday),
      wednesday: toDayHours(openHours.wednesday),
      thursday: toDayHours(openHours.thursday),
      friday: toDayHours(openHours.friday),
      saturday: toDayHours(openHours.saturday),
      sunday: toDayHours(openHours.sunday),
    },
    contact: {
      mailLabel: mail,
      mailHref: getMailto(mail),
      phoneLabel: phone,
      phoneHref: getTel(phone),
      mapsLink: googleMapsLink ?? undefined,
    },
    games: games.map((game) => ({
      label: game.name,
      url: getRoutesForLang(lang).venueGame(venueSlug, game.slug),
    })),
    paymentMethods: acceptedPaymentMethods.map((method) => toCmsImage(method)),
  };
}

export async function getVenueFooterData({
  venueSlug,
  lang,
  config,
}: {
  venueSlug: string;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchVenueFooter({ config, lang, venueSlug });

  return adaptVenueFooter({ data, lang, venueSlug });
}
