import { fetchHeader, type SanityHeader } from "@repo/api/sanity/header";
import { getMailto } from "@repo/utils/getMailto";
import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { Header } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptHeader({
  data,
  lang,
  venueSlug,
}: {
  data: SanityHeader;
  lang: Lang;
  venueSlug: string;
}): Header {
  return {
    logo: toCmsImage(data.siteSettings.headerLogo),
    venue: {
      logo: toCmsImage(data.venue.venueLogo),
      address: data.venue.addressLine,
      mapsLink: data.venue.googleMapsLink,
      mail: data.venue.mail,
      mailLink: getMailto(data.venue.mail),
      phone: data.venue.phone,
      phoneLink: `tel:${data.venue.phone}`,
    },
    experiences: data.venue.games.map((format) => ({
      label: format.name,
      url: getRoutesForLang(lang).venueGame(venueSlug, format.slug),
    })),
  };
}

export async function getHeaderData({
  config,
  lang,
  venueSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
}) {
  const data = await fetchHeader({ config, lang, venueSlug });

  return adaptHeader({ data, lang, venueSlug });
}
