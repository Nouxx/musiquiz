import { fetchSanityData } from "@repo/api/sanity/fetchData";
import { fetchHeaderQuery } from "@repo/api/sanity/queries";
import { SanityHeaderSchema } from "@repo/api/sanity/schema";
import type { SanityHeader } from "@repo/api/sanity/types";
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
  const data = await fetchSanityData({
    query: fetchHeaderQuery({ lang, venueSlug }),
    schema: SanityHeaderSchema,
    config,
  });

  return adaptHeader(data);
}
