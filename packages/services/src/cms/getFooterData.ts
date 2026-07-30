import { getSanityClient } from "@repo/api/sanity/client";
import { fetchSiteSettingsData } from "@repo/api/sanity/fetchSiteSettings";
import { type SanitySiteSettings } from "@repo/api/sanity/types";

import type { Footer } from "./types";

function adaptFooter(siteSettings: SanitySiteSettings): Footer {
  const {
    footerLogo,
    facebookUrl,
    instagramUrl,
    linkedinUrl,
    tiktokUrl,
    youtubeUrl,
    mainEmail,
    mainPhone,
  } = siteSettings;
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
  };
}

export async function getFooterData({
  projectId,
  dataset,
  draft,
  token,
}: {
  projectId: string;
  dataset: string;
  draft?: boolean;
  token?: string;
}) {
  const sanityClient = getSanityClient({ projectId, dataset, draft, token });

  const siteSettingsData = await fetchSiteSettingsData({ sanityClient });

  return adaptFooter(siteSettingsData);
}
