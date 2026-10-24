import { expect, it } from "vitest";

import {
  buildOptinDate,
  buildOptinSource,
  newsletterFormBodySchema,
  pickNewsletterChannel,
} from "./newsletter";

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

const mailing = { title: "Paris", ownerMails: ["owner@example.com"] };

it("mails the owners of a venue on zeptomail, key or not", () => {
  expect(
    pickNewsletterChannel({
      venue: { ...mailing, provider: "zeptomail" },
      venueSlug: "paris",
      brevoApiKey: "xkeysib-123",
    }),
  ).toEqual({ channel: "zeptomail" });
});

it("signs up to Brevo when the venue is on Brevo and has its key", () => {
  expect(
    pickNewsletterChannel({
      venue: { ...mailing, provider: "brevo", brevoListId: 7 },
      venueSlug: "paris",
      brevoApiKey: "xkeysib-123",
    }),
  ).toEqual({ channel: "brevo", apiKey: "xkeysib-123", listId: 7 });
});

it("falls back to the owners and names the secret when the key is missing", () => {
  const channel = pickNewsletterChannel({
    venue: { ...mailing, provider: "brevo", brevoListId: 7 },
    venueSlug: "saint-etienne",
    brevoApiKey: undefined,
  });

  expect(channel.channel).toBe("zeptomail");
  expect("brevoError" in channel && channel.brevoError?.message).toContain(
    "BREVO_API_KEY_SAINT_ETIENNE",
  );
});

it("names the opt-in source after the venue and the footer", () => {
  expect(buildOptinSource("lille")).toBe("site-lille-footer");
  expect(buildOptinSource("saint-etienne")).toBe("site-saint-etienne-footer");
});

it("dates the opt-in as YYYY-MM-DD in Paris time", () => {
  expect(buildOptinDate(new Date("2026-10-23T12:00:00Z"))).toBe("2026-10-23");
  expect(buildOptinDate(new Date("2026-10-23T22:30:00Z"))).toBe("2026-10-24");
  expect(buildOptinDate(new Date("2026-01-05T08:00:00Z"))).toBe("2026-01-05");
});
