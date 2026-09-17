import { emailTemplateKeys } from "@repo/api/zeptomail/emailTemplateKeys";
import { sendEmailWithTemplate } from "@repo/api/zeptomail/sendEmailWithTemplate";
import { expect, it, vi } from "vitest";

import {
  adaptVenueOpeningMergeInfo,
  processVenueOpeningForm,
  venueOpeningFormBodySchema,
} from "./venueOpening";

vi.mock("@repo/api/zeptomail/sendEmailWithTemplate", () => ({
  sendEmailWithTemplate: vi.fn(),
}));

function buildBody(overrides: Record<string, unknown> = {}) {
  return {
    profile: "projectHolder",
    intent: "dedicatedCentre",
    city: "Lyon",
    population: "from150kTo500k",
    premises: "shortlisted",
    horizon: "from6To12Months",
    contribution: "from20kTo50k",
    experience: "firstVenture",
    partners: "onePartner",
    firstName: "Camille",
    lastName: "Durand",
    mail: "camille@example.com",
    phone: "0612345678",
    source: "google",
    message: "",
    rgpd: true,
    ...overrides,
  };
}

function accepts(overrides: Record<string, unknown> = {}) {
  return venueOpeningFormBodySchema.safeParse(buildBody(overrides)).success;
}

it("accepts a filled body with an empty message", () => {
  expect(accepts()).toBe(true);
});

it("rejects an unknown key", () => {
  expect(accepts({ admin: true })).toBe(false);
});

it("rejects a choice outside the option set", () => {
  expect(accepts({ profile: "Porteur de projet" })).toBe(false);
  expect(accepts({ population: "" })).toBe(false);
  expect(accepts({ source: "linkedin" })).toBe(false);
});

it("requires the consent tick", () => {
  expect(accepts({ rgpd: false })).toBe(false);
  expect(accepts({ rgpd: "on" })).toBe(false);
});

it("requires names, city, phone and a well-formed mail", () => {
  expect(accepts({ firstName: "" })).toBe(false);
  expect(accepts({ lastName: "" })).toBe(false);
  expect(accepts({ city: "" })).toBe(false);
  expect(accepts({ phone: "" })).toBe(false);
  expect(accepts({ mail: "camille" })).toBe(false);
  expect(accepts({ message: "a".repeat(2001) })).toBe(false);
});

it("merges the client's tags with the French wording", () => {
  const body = venueOpeningFormBodySchema.parse(buildBody());

  expect(adaptVenueOpeningMergeInfo(body)).toEqual({
    profil: "Porteur·se de projet, je veux créer mon activité",
    intention: "Ouvrir un centre Musi'Quiz dédié (mono-activité)",
    ville_projet: "Lyon",
    population: "150 000 à 500 000 hab.",
    local: "J'ai identifié des pistes",
    horizon: "Dans 6 à 12 mois",
    apport: "20 000 € à 50 000 €",
    experience: "Ce serait ma première création",
    associes: "Avec 1 associé·e",
    prenom: "Camille",
    nom: "Durand",
    email: "camille@example.com",
    telephone: "0612345678",
    source: "Recherche Google",
    message: "",
    rgpd: "Oui",
    lead_score: "60",
    lead_qualification: "🟡 LEAD TIÈDE",
  });
});

it("sends the lead to the network address and a copy to the applicant", async () => {
  const sent = vi.mocked(sendEmailWithTemplate);
  sent.mockClear();
  sent.mockResolvedValue(undefined as never);

  await processVenueOpeningForm({
    body: venueOpeningFormBodySchema.parse(buildBody()),
    zeptomailToken: "token",
  });

  expect(
    sent.mock.calls.map(([call]) => [
      call.templateKey,
      call.destinationAddress,
    ]),
  ).toEqual([
    [
      emailTemplateKeys.venueOpening.internalMailTemplateKey,
      "contact@musiquiz.co",
    ],
    [emailTemplateKeys.venueOpening.clientTemplateKey, "camille@example.com"],
  ]);
});

it("fails the request only when the internal mail fails", async () => {
  const sent = vi.mocked(sendEmailWithTemplate);
  sent.mockClear();
  sent.mockRejectedValueOnce(new Error("internal down"));
  sent.mockResolvedValueOnce(undefined as never);

  const body = venueOpeningFormBodySchema.parse(buildBody());
  const failing = processVenueOpeningForm({ body, zeptomailToken: "token" });

  await expect(failing).rejects.toThrow("internal down");

  sent.mockResolvedValueOnce(undefined as never);
  sent.mockRejectedValueOnce(new Error("applicant bounced"));

  const { confirmationError } = await processVenueOpeningForm({
    body,
    zeptomailToken: "token",
  });

  expect(confirmationError).toEqual(new Error("applicant bounced"));
});
