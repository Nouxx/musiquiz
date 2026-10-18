import {
  fetchVenuePopup,
  type SanityVenuePopup,
} from "@repo/api/sanity/venuePopup";
import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { VenuePopup } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function adaptVenuePopup(
  popup: NonNullable<SanityVenuePopup["popup"]>,
): VenuePopup {
  return {
    dismissKey: `popup:${popup._id}:${popup._rev}`,
    background: popup.background,
    title: popup.title,
    text: popup.text,
    cta: popup.cta,
    logo: popup.logo ? toCmsImage(popup.logo) : undefined,
  };
}

/** `undefined` when the venue has no pop-up turned on */
export async function getVenuePopupData({
  config,
  lang,
  venueSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
}) {
  const { popup } = await fetchVenuePopup({ config, lang, venueSlug });

  return popup ? adaptVenuePopup(popup) : undefined;
}
