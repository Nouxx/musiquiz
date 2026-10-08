import { fetchHeader, type SanityHeader } from "@repo/api/sanity/header";
import { getMailto } from "@repo/utils/getMailto";
import { getTel } from "@repo/utils/getTel";
import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { Header } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptHeader({
  data,
  lang,
}: {
  data: SanityHeader;
  lang: Lang;
}): Header {
  const routes = getRoutesForLang(lang);

  return {
    logo: toCmsImage(data.siteSettings.headerLogo),
    mobileMenuLogo: toCmsImage(data.siteSettings.mobileMenuLogo),
    contact: {
      mailLabel: data.siteSettings.mainEmail,
      mailHref: getMailto(data.siteSettings.mainEmail),
      phoneLabel: data.siteSettings.mainPhone,
      phoneHref: getTel(data.siteSettings.mainPhone),
    },
    experiences: data.games.map((format) => ({
      label: format.name,
      url: routes.game(format.slug),
    })),
    events: data.events.map((format) => ({
      label: format.name,
      url: routes.event(format.slug),
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

export async function getHeaderData({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  const data = await fetchHeader({ config, lang });

  return adaptHeader({ data, lang });
}
