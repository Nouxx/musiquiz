import { fetchHeader, type SanityHeader } from "@repo/api/sanity/header";
import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Header } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptHeader(data: SanityHeader): Header {
  return {
    logo: toCmsImage(data.siteSettings.headerLogo),
    experiences: data.gameFormats.map((format) => ({
      label: format.game.name,
      slug: format.game.slug,
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

  return adaptHeader(data);
}
