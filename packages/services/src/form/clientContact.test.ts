import { expect, it } from "vitest";

import { clientContactFormBodySchema } from "./clientContact";

function buildBody(overrides: Record<string, unknown> = {}) {
  return {
    venueSlug: "paris",
    firstName: "Camille",
    mail: "camille@example.com",
    phone: "0612345678",
    message: "Bonjour, une question sur vos formules.",
    ...overrides,
  };
}

function accepts(overrides: Record<string, unknown> = {}) {
  return clientContactFormBodySchema.safeParse(buildBody(overrides)).success;
}

it("accepts a filled body", () => {
  expect(accepts()).toBe(true);
});

it("accepts an empty phone", () => {
  expect(accepts({ phone: "" })).toBe(true);
});

it("rejects an unknown key", () => {
  expect(
    clientContactFormBodySchema.safeParse({ ...buildBody(), admin: true })
      .success,
  ).toBe(false);
});

it("accepts a hyphenated venue slug", () => {
  expect(accepts({ venueSlug: "paris-bastille" })).toBe(true);
});

it("rejects a venue slug that steers the recipient", () => {
  expect(accepts({ venueSlug: "someone@example.com" })).toBe(false);
  expect(accepts({ venueSlug: "paris, someone" })).toBe(false);
  expect(accepts({ venueSlug: "paris\nbcc" })).toBe(false);
  expect(accepts({ venueSlug: "paris+bcc" })).toBe(false);
});

it("rejects a venue slug that is not a bare slug", () => {
  expect(accepts({ venueSlug: "" })).toBe(false);
  expect(accepts({ venueSlug: "Paris" })).toBe(false);
  expect(accepts({ venueSlug: "-paris" })).toBe(false);
  expect(accepts({ venueSlug: "2paris" })).toBe(false);
  expect(accepts({ venueSlug: "a".repeat(41) })).toBe(false);
});

it("requires a first name and caps it", () => {
  expect(accepts({ firstName: "" })).toBe(false);
  expect(accepts({ firstName: "a".repeat(80) })).toBe(true);
  expect(accepts({ firstName: "a".repeat(81) })).toBe(false);
});

it("requires a well-formed mail address", () => {
  expect(accepts({ mail: "" })).toBe(false);
  expect(accepts({ mail: "camille" })).toBe(false);
  expect(accepts({ mail: "camille@" })).toBe(false);
});

// the address regex puts no bound on the local part, so the cap is the only
// thing standing between a long address and the mail API
it("caps the mail address length", () => {
  expect(accepts({ mail: `${"a".repeat(246)}@ex.com` })).toBe(true);
  expect(accepts({ mail: `${"a".repeat(250)}@ex.com` })).toBe(false);
});

it("caps the phone length", () => {
  expect(accepts({ phone: "0".repeat(30) })).toBe(true);
  expect(accepts({ phone: "0".repeat(31) })).toBe(false);
});

it("requires a message and caps it", () => {
  expect(accepts({ message: "" })).toBe(false);
  expect(accepts({ message: "a".repeat(2000) })).toBe(true);
  expect(accepts({ message: "a".repeat(2001) })).toBe(false);
});
