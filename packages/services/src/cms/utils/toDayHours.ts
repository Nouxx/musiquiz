import type { SanityDayHours } from "@repo/api/sanity/shared/openingHours";

import type { DayHours } from "../types";

export function toDayHours(day: SanityDayHours): DayHours {
  if (day.closed) return { closed: true };

  const [opens, closes] = day.hours.split(" - ");
  return { closed: false, opens, closes };
}
