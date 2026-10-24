import { expect, it } from "vitest";

import { openingHoursPattern } from "./openingHours";

it.each(["09:30 - 20:00", "14:00 - 01:00", "00:00 - 23:59"])(
  "accepts %s",
  (value) => {
    expect(openingHoursPattern.test(value)).toBe(true);
  },
);

it.each([
  "",
  "Fermé",
  "9:30 - 20:00",
  "09:30-20:00",
  "24:00 - 02:00",
  "09:60 - 20:00",
])("rejects %s", (value) => {
  expect(openingHoursPattern.test(value)).toBe(false);
});
