import { expect, it } from "vitest";

import { toOpeningHours } from "./toOpeningHours";

const week = {
  Monday: "Fermé",
  Tuesday: "14:00 - 23:00",
  Wednesday: "14:00 - 23:00",
  Thursday: "14:00 - 23:00",
  Friday: "14:00 - 01:00",
  Saturday: "10:00 - 01:00",
  Sunday: "10:00 - 20:00",
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
      ...week,
      Tuesday: "Fermé",
      Wednesday: "Fermé",
      Thursday: "Fermé",
      Friday: "Fermé",
      Saturday: "Fermé",
      Sunday: "Fermé",
    }),
  ).toEqual([]);
});
