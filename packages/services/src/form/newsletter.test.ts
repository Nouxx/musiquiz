import { expect, it } from "vitest";

import { newsletterFormBodySchema } from "./newsletter";

function buildBody(overrides: Record<string, unknown> = {}) {
  return {
    venueSlug: "paris",
    mail: "camille@example.com",
    rgpd: true,
    ...overrides,
  };
}

function accepts(overrides: Record<string, unknown> = {}) {
  return newsletterFormBodySchema.safeParse(buildBody(overrides)).success;
}

it("accepts a complete body", () => {
  expect(accepts()).toBe(true);
});

it("requires the consent tick", () => {
  expect(accepts({ rgpd: false })).toBe(false);
  expect(accepts({ rgpd: "on" })).toBe(false);
});

it("requires a well-formed mail", () => {
  expect(accepts({ mail: "" })).toBe(false);
  expect(accepts({ mail: "camille" })).toBe(false);
});

it("rejects a slug that is not a bare slug", () => {
  expect(accepts({ venueSlug: "paris@evil.com" })).toBe(false);
});

it("rejects unknown keys", () => {
  expect(accepts({ firstName: "Camille" })).toBe(false);
});
