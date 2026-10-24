import { expect, it } from "vitest";

import { splitIntoAsciiWords } from "./splitIntoAsciiWords";

it.each([
  ["paris", ["paris"]],
  ["saint-etienne", ["saint", "etienne"]],
  ["Saint-Étienne", ["saint", "etienne"]],
  ["Villeneuve-d'Ascq", ["villeneuve", "d", "ascq"]],
  ["Villeneuve-d’Ascq", ["villeneuve", "d", "ascq"]],
  ["La Réunion", ["la", "reunion"]],
  ["Cœur de Lyon", ["coeur", "de", "lyon"]],
  ["Lætitia", ["laetitia"]],
  ["Straße", ["strasse"]],
  ["  -paris--bastille_  ", ["paris", "bastille"]],
  ["paris.bastille/11e", ["paris", "bastille", "11e"]],
  ["İstanbul", ["istanbul"]],
  ["Paris 🎵 Bastille", ["paris", "bastille"]],
])("splits %j", (value, words) => {
  expect(splitIntoAsciiWords(value)).toEqual(words);
});

it.each(["", "---", "  ", "🎵", "東京"])("finds no word in %j", (value) => {
  expect(splitIntoAsciiWords(value)).toEqual([]);
});
