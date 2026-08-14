import { fetchFooter, type SanityFooter } from "@repo/api/sanity/footer";
import { getMailto } from "@repo/utils/getMailto";
import { getTel } from "@repo/utils/getTel";
import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Footer } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptFooter({ data }: { data: SanityFooter; lang: Lang }): Footer {
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
    gamesFormatsLinks: data.gameFormats.map((format) => ({
      label: format.name,
      url: "#todo", // TODO: what do we do with this?
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
