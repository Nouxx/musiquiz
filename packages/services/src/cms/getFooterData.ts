import { fetchFooter, type SanityFooter } from "@repo/api/sanity/footer";
import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Footer } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptFooter({ data }: { data: SanityFooter }): Footer {
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
      mail: mainEmail,
      phone: mainPhone,
    },
    newsletter: false,
    gamesFormatsLinks: data.gameFormats.map((format) => ({
      label: format.name,
      slug: format.slug,
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

  return adaptFooter({ data });
}
