import { expect, it } from "vitest";

import { buildBrevoApiKeyName } from "./buildBrevoApiKeyName";

it.each([
  ["paris", "BREVO_API_KEY_PARIS"],
  ["saint-etienne", "BREVO_API_KEY_SAINT_ETIENNE"],
  ["villeneuve-d-ascq", "BREVO_API_KEY_VILLENEUVE_D_ASCQ"],
  ["paris-11e", "BREVO_API_KEY_PARIS_11E"],
  ["Saint-Étienne", "BREVO_API_KEY_SAINT_ETIENNE"],
  ["villeneuve-d'ascq", "BREVO_API_KEY_VILLENEUVE_D_ASCQ"],
  ["-la--reunion-", "BREVO_API_KEY_LA_REUNION"],
  ["paris_bastille", "BREVO_API_KEY_PARIS_BASTILLE"],
  [" paris bastille ", "BREVO_API_KEY_PARIS_BASTILLE"],
  ["cœur", "BREVO_API_KEY_COEUR"],
])("names the secret of %j", (venueSlug, name) => {
  expect(buildBrevoApiKeyName(venueSlug)).toBe(name);
});

it("only ever yields SCREAMING_SNAKE_CASE", () => {
  for (const venueSlug of [
    "Ünïcödé--slug",
    String.raw`a.b/c\d`,
    "x__y",
    "🎵paris🎵",
  ]) {
    expect(buildBrevoApiKeyName(venueSlug)).toMatch(
      /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/,
    );
  }
});

it.each(["", "---", "🎵"])("refuses %j", (venueSlug) => {
  expect(() => buildBrevoApiKeyName(venueSlug)).toThrow();
});
