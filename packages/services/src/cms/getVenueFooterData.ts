import { fetchSanityData } from "@repo/api/sanity/fetchData";
import { fetchVenueFooterQuery } from "@repo/api/sanity/queries";
import { SanityVenueFooterSchema } from "@repo/api/sanity/schema";
import type { SanityVenueFooter } from "@repo/api/sanity/types";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenueFooter } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptVenueFooter(data: SanityVenueFooter): VenueFooter {
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
      mail,
      phone,
      mapsLink: googleMapsLink ?? undefined,
    },
    games: offerings.map((offer) => ({
      label: offer.game.name,
      slug: offer.game.slug,
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
  const data = await fetchSanityData({
    query: fetchVenueFooterQuery({ venueSlug, lang }),
    schema: SanityVenueFooterSchema,
    config,
  });

  return adaptVenueFooter(data);
}
