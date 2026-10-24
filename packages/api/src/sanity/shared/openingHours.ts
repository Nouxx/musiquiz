import { openingHoursPattern } from "@repo/utils/openingHours";
import { z } from "zod";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function dayHoursProjection(day: (typeof DAYS)[number]) {
  return `"${day}": {
    "closed": ${day}Closed,
    "hours": select(${day}Closed => null, ${day}OpeningHours)
  }`;
}

export const openHoursProjection = `{
  ${DAYS.map((day) => dayHoursProjection(day)).join(",\n  ")}
}`;

const sanityDayHoursSchema = z.discriminatedUnion("closed", [
  z.strictObject({ closed: z.literal(true), hours: z.null() }),
  z.strictObject({
    closed: z.literal(false),
    hours: z.string().regex(openingHoursPattern),
  }),
]);

export const sanityOpenHoursSchema = z.strictObject({
  monday: sanityDayHoursSchema,
  tuesday: sanityDayHoursSchema,
  wednesday: sanityDayHoursSchema,
  thursday: sanityDayHoursSchema,
  friday: sanityDayHoursSchema,
  saturday: sanityDayHoursSchema,
  sunday: sanityDayHoursSchema,
});

export type SanityDayHours = z.infer<typeof sanityDayHoursSchema>;
