import {
  fetchVenueHomepage,
  type SanityVenueHomepage,
} from "@repo/api/sanity/venueHomepage";
import { type Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenueHomepage } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptVenueHomepage(data: SanityVenueHomepage): VenueHomepage {
  const {
    pageCoverMedia,
    pageCoverHeading,
    pageCoverSubHeading,
    pageCoverBadge,
    pageCoverCtaLabel,
  } = data.pageCover;

  return {
    pageCover: {
      media: toCmsImage(pageCoverMedia),
      badge: pageCoverBadge ?? undefined,
      heading: pageCoverHeading,
      subHeading: pageCoverSubHeading,
      ctaLabel: pageCoverCtaLabel,
    },
  };
}

export async function getVenueHomepageData({
  venueSlug,
  lang,
  config,
}: {
  venueSlug: string;
  lang: Lang;
  config: SanityConfig;
}) {
  const data = await fetchVenueHomepage({ config, lang, venueSlug });

  return adaptVenueHomepage(data);
}
