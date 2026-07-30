import { fetchSanityData } from "@repo/api/sanity/fetchData";
import { fetchFooterQuery } from "@repo/api/sanity/queries";
import { SanityFooterSchema } from "@repo/api/sanity/schema";
import { type SanityFooter } from "@repo/api/sanity/types";
import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Footer } from "./types";

function getLanguageLinkForLang(lang: Lang): Footer["languageLink"] {
  return lang === "fr"
    ? { lang: "en", label: "English", url: `en/` }
    : { lang: "fr", label: "Français", url: `/` };
}

function adaptFooter({
  data,
  lang,
}: {
  data: SanityFooter;
  lang: Lang;
}): Footer {
  const {
    footerLogo,
    facebookUrl,
    instagramUrl,
    linkedinUrl,
    tiktokUrl,
    youtubeUrl,
    mainEmail,
    mainPhone,
  } = data.siteSettings;

  return {
    logo: footerLogo,
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
      url: format.slug,
    })),
    languageLink: getLanguageLinkForLang(lang),
  };
}

export async function getFooterData({
  lang,
  config,
}: {
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchSanityData({
    query: fetchFooterQuery(),
    schema: SanityFooterSchema,
    config,
  });

  return adaptFooter({ data, lang });
}
