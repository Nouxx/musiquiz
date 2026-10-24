import type { DayHours, DayOfWeek, OpeningHours } from "../types";

// a closed day is left out: that is how schema.org says closed
export function toOpeningHours(
  hoursByDay: Record<DayOfWeek, DayHours>,
): OpeningHours[] {
  const groups = new Map<string, OpeningHours>();

  for (const [day, hours] of Object.entries(hoursByDay)) {
    if (hours.closed) continue;

    const { opens, closes } = hours;
    const key = `${opens}-${closes}`;
    const group = groups.get(key);
    if (group) {
      group.days.push(day as DayOfWeek);
    } else {
      groups.set(key, { days: [day as DayOfWeek], opens, closes });
    }
  }

  return groups.values().toArray();
}
