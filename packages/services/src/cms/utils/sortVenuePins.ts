import type { Lang } from "@repo/utils/lang";

import type { VenuePin } from "../types";

export function sortVenuePins<T extends VenuePin>({
  venues,
  lang,
}: {
  venues: T[];
  lang: Lang;
}): T[] {
  return venues.toSorted((a, b) => a.title.localeCompare(b.title, lang));
}
