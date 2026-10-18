import type { Lang } from "@repo/utils/lang";

import type { VenuePin } from "../types";

export function sortVenuePins({
  venues,
  lang,
}: {
  venues: VenuePin[];
  lang: Lang;
}): VenuePin[] {
  return venues.toSorted((a, b) => a.title.localeCompare(b.title, lang));
}
