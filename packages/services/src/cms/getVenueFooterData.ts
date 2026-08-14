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

function adaptVenueFooter({
  data,
  lang,
  venueSlug,
}: {
  data: SanityVenueFooter;
  lang: Lang;
  venueSlug: string;
}): VenueFooter {
  const {
    footerLogo,
    facebookUrl,
    instagramUrl,
    linkedinUrl,
    tiktokUrl,
    youtubeUrl,
    acceptedPaymentMethods,
  } = data.siteSettings;

  const {
    title,
    mondayOpeningHours,
    tuesdayOpeningHours,
    wednesdayOpeningHours,
    thursdayOpeningHours,
    fridayOpeningHours,
    saturdayOpeningHours,
    sundayOpeningHours,
    offerings,
    mail,
    phone,
    googleMapsLink,
  } = data.venue;

  return {
    logo: toCmsImage(footerLogo),
    socials: {
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      tiktokUrl,
      youtubeUrl,
    },
    newsletter: true,
    venueTitle: title,
    openHours: {
      monday: mondayOpeningHours,
      tuesday: tuesdayOpeningHours,
      wednesday: wednesdayOpeningHours,
      thursday: thursdayOpeningHours,
      friday: fridayOpeningHours,
      saturday: saturdayOpeningHours,
      sunday: sundayOpeningHours,
    },
    contact: {
      mailLabel: mail,
      mailHref: getMailto(mail),
      phoneLabel: phone,
      phoneHref: getTel(phone),
      mapsLink: googleMapsLink ?? undefined,
    },
    games: offerings.map((offer) => ({
      label: offer.game.name,
      url: getRoutesForLang(lang).venueGame(venueSlug, offer.game.slug),
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
