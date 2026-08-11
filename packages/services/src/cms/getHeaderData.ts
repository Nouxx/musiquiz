import { fetchHeader, type SanityHeader } from "@repo/api/sanity/header";
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
    experiences: data.gameFormats.map((format) => ({
      label: format.game.name,
      url: getRoutesForLang(lang).venueGame(venueSlug, format.game.slug),
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
