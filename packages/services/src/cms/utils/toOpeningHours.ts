import type { DayOfWeek, OpeningHours } from "../types";

const HOURS = /^(\d{2}:\d{2}) - (\d{2}:\d{2})$/;

// a closed day ("Fermé") is left out: that is how schema.org says closed
export function toOpeningHours(
  hoursByDay: Record<DayOfWeek, string>,
): OpeningHours[] {
  const groups = new Map<string, OpeningHours>();

  for (const [day, hours] of Object.entries(hoursByDay)) {
    const match = HOURS.exec(hours);
    if (!match) continue;

    const [, opens, closes] = match;
    const group = groups.get(hours);
    if (group) {
      group.days.push(day as DayOfWeek);
    } else {
      groups.set(hours, { days: [day as DayOfWeek], opens, closes });
    }
  }

  return groups.values().toArray();
}
