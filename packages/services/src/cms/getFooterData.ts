import { fetchSanityData } from "@repo/api/sanity/fetchData";
import { fetchGlobalFooterQuery } from "@repo/api/sanity/queries";
import { SanityGlobalFooterSchema } from "@repo/api/sanity/schema";
import { type SanityGlobalFooter } from "@repo/api/sanity/types";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Footer } from "./types";

function adaptGlobalFooter(data: SanityGlobalFooter): Footer {
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
  };
}

export async function getFooterData({ config }: { config: SanityConfig }) {
  const data = await fetchSanityData({
    query: fetchGlobalFooterQuery(),
    schema: SanityGlobalFooterSchema,
    config,
  });

  return adaptGlobalFooter(data);
}
