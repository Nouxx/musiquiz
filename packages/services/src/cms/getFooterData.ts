import { fetchFooter, type SanityFooter } from "@repo/api/sanity/footer";
import { getMailto } from "@repo/utils/getMailto";
import { getTel } from "@repo/utils/getTel";
import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { Footer } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptFooter({
  data,
  lang,
}: {
  data: SanityFooter;
  lang: Lang;
}): Footer {
  const routes = getRoutesForLang(lang);

  const {
    footerLogo,
    facebookUrl,
    instagramUrl,
    linkedinUrl,
    tiktokUrl,
    youtubeUrl,
    mainEmail,
    mainPhone,
    acceptedPaymentMethods,
  } = data.siteSettings;

  return {
    logo: toCmsImage(footerLogo),
    socials: {
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      tiktokUrl,
      youtubeUrl,
    },
    contact: {
      mailLabel: mainEmail,
      mailHref: getMailto(mainEmail),
      phoneLabel: mainPhone,
      phoneHref: getTel(mainPhone),
    },
    newsletter: false,
    games: data.games.map((format) => ({
      label: format.name,
      url: routes.game(format.slug),
    })),
    paymentMethods: acceptedPaymentMethods.map((method) => toCmsImage(method)),
  };
}

export async function getFooterData({
  lang,
  config,
}: {
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchFooter({ config, lang });

  return adaptFooter({ data, lang });
}
