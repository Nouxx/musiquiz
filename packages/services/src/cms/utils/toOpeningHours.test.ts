import { expect, it } from "vitest";

import type { DayHours } from "../types";
import { toOpeningHours } from "./toOpeningHours";

const closed: DayHours = { closed: true };

function open(opens: string, closes: string): DayHours {
  return { closed: false, opens, closes };
}

const week = {
  Monday: closed,
  Tuesday: open("14:00", "23:00"),
  Wednesday: open("14:00", "23:00"),
  Thursday: open("14:00", "23:00"),
  Friday: open("14:00", "01:00"),
  Saturday: open("10:00", "01:00"),
  Sunday: open("10:00", "20:00"),
};

it("groups the days that share their hours", () => {
  expect(toOpeningHours(week)).toEqual([
    {
      days: ["Tuesday", "Wednesday", "Thursday"],
      opens: "14:00",
      closes: "23:00",
    },
    { days: ["Friday"], opens: "14:00", closes: "01:00" },
    { days: ["Saturday"], opens: "10:00", closes: "01:00" },
    { days: ["Sunday"], opens: "10:00", closes: "20:00" },
  ]);
});

it("leaves closed days out", () => {
  expect(
    toOpeningHours({
      Monday: closed,
      Tuesday: closed,
      Wednesday: closed,
      Thursday: closed,
      Friday: closed,
      Saturday: closed,
      Sunday: closed,
    }),
  ).toEqual([]);
});
