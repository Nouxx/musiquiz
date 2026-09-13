import { emailTemplateKeys } from "@repo/api/zeptomail/emailTemplateKeys";
import { sendEmailWithTemplate } from "@repo/api/zeptomail/sendEmailWithTemplate";
import { expect, it, vi } from "vitest";

import {
  adaptQuotationMergeInfo,
  processQuotationForm,
  quotationFormBodySchema,
} from "./quotation";

vi.mock("@repo/api/zeptomail/sendEmailWithTemplate", () => ({
  sendEmailWithTemplate: vi.fn(),
}));

function buildBody(overrides: Record<string, unknown> = {}) {
  return {
    venueSlug: "paris",
    audience: "teamBuilding",
    lastName: "Durand",
    firstName: "Camille",
    mail: "camille@example.com",
    phone: "0612345678",
    company: "Acme SAS",
    date: "2026-10-14",
    time: "19:30",
    participants: "24",
    budget: "2000",
    services: ["Blind test"],
    message: "Bonjour, nous cherchons une date en octobre.",
    ...overrides,
  };
}

function accepts(overrides: Record<string, unknown> = {}) {
  return quotationFormBodySchema.safeParse(buildBody(overrides)).success;
}

it("accepts a filled body", () => {
  expect(accepts()).toBe(true);
});

it("accepts the optional fields left empty", () => {
  expect(
    accepts({ phone: "", company: "", participants: "", budget: "" }),
  ).toBe(true);
});

it("accepts no ticked service", () => {
  expect(accepts({ services: [] })).toBe(true);
});

it("rejects an audience with no template of its own", () => {
  expect(accepts({ audience: "musiTeens" })).toBe(true);
  expect(accepts({ audience: "evgEvjf" })).toBe(false);
  expect(accepts({ audience: "" })).toBe(false);
});

it("rejects an unknown key", () => {
  expect(
    quotationFormBodySchema.safeParse({
      ...buildBody(),
      admin: true,
    }).success,
  ).toBe(false);
});

it("rejects a venue slug that steers the recipient", () => {
  expect(accepts({ venueSlug: "someone@example.com" })).toBe(false);
  expect(accepts({ venueSlug: "paris, someone" })).toBe(false);
  expect(accepts({ venueSlug: "paris\nbcc" })).toBe(false);
});

it("requires both names and caps them", () => {
  expect(accepts({ lastName: "" })).toBe(false);
  expect(accepts({ firstName: "" })).toBe(false);
  expect(accepts({ lastName: "a".repeat(80) })).toBe(true);
  expect(accepts({ lastName: "a".repeat(81) })).toBe(false);
  expect(accepts({ firstName: "a".repeat(81) })).toBe(false);
});

it("requires a well-formed mail address and caps it", () => {
  expect(accepts({ mail: "camille" })).toBe(false);
  expect(accepts({ mail: `${"a".repeat(250)}@ex.com` })).toBe(false);
});

it("requires a date and a time in the shape the inputs produce", () => {
  expect(accepts({ date: "" })).toBe(false);
  expect(accepts({ date: "14/10/2026" })).toBe(false);
  expect(accepts({ time: "" })).toBe(false);
  expect(accepts({ time: "7pm" })).toBe(false);
});

it("caps the ticked services, by count and by length", () => {
  expect(accepts({ services: Array.from({ length: 20 }, () => "a") })).toBe(
    true,
  );
  expect(accepts({ services: Array.from({ length: 21 }, () => "a") })).toBe(
    false,
  );
  expect(accepts({ services: ["a".repeat(200)] })).toBe(true);
  expect(accepts({ services: ["a".repeat(201)] })).toBe(false);
});

it("requires a message and caps it", () => {
  expect(accepts({ message: "" })).toBe(false);
  expect(accepts({ message: "a".repeat(2000) })).toBe(true);
  expect(accepts({ message: "a".repeat(2001) })).toBe(false);
});

it("joins the ticked services into one merge field", () => {
  const body = quotationFormBodySchema.parse(
    buildBody({ services: ["Blind test", "Karaoké"] }),
  );

  expect(adaptQuotationMergeInfo(body).prestations).toBe("Blind test, Karaoké");
});

it("sends with the template pair of the audience", async () => {
  const sent = vi.mocked(sendEmailWithTemplate);
  sent.mockClear();
  sent.mockResolvedValue(undefined as never);

  await processQuotationForm({
    body: quotationFormBodySchema.parse(buildBody({ audience: "musiTeens" })),
    zeptomailToken: "token",
  });

  expect(sent.mock.calls.map(([call]) => call.templateKey)).toEqual([
    emailTemplateKeys.musiTeens.internalMailTemplateKey,
    emailTemplateKeys.musiTeens.clientTemplateKey,
  ]);
});
