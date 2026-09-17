import { describe, expect, it } from "vitest";

import {
  scoreVenueOpeningLead,
  type VenueOpeningLeadAnswers,
} from "./scoreVenueOpeningLead";

// 8 + 7 + 6 + 8 + 4 + 15 + 8 + 2 = 58, no cap in reach
const baseline: VenueOpeningLeadAnswers = {
  contribution: "from10kTo20k",
  profile: "projectHolder",
  premises: "shortlisted",
  intent: "dedicatedCentre",
  population: "from50kTo150k",
  horizon: "within6Months",
  experience: "previousVentures",
  partners: "alone",
};

const strongest: VenueOpeningLeadAnswers = {
  contribution: "over80k",
  profile: "leisureCentreManager",
  premises: "secured",
  intent: "multiActivityCentre",
  population: "over500k",
  horizon: "within6Months",
  experience: "industryInsider",
  partners: "group",
};

function score(overrides: Partial<VenueOpeningLeadAnswers> = {}) {
  return scoreVenueOpeningLead({ ...baseline, ...overrides });
}

it("tops out at 100", () => {
  expect(scoreVenueOpeningLead(strongest)).toEqual({
    score: 100,
    qualification: "hot",
  });
});

it("scores the baseline as warm", () => {
  expect(score()).toEqual({ score: 58, qualification: "warm" });
});

describe("weights", () => {
  it.each([
    ["over80k", 75],
    ["from50kTo80k", 70],
    ["from20kTo50k", 64],
    ["from10kTo20k", 58],
    ["from5kTo10k", 53],
  ] as const)("contribution %s → %i", (contribution, expected) => {
    expect(score({ contribution }).score).toBe(expected);
  });

  it.each([
    ["leisureCentreManager", 66],
    ["establishedEntrepreneur", 63],
    ["investor", 61],
    ["projectHolder", 58],
    ["other", 55],
  ] as const)("profile %s → %i", (profile, expected) => {
    expect(score({ profile }).score).toBe(expected);
  });

  it.each([
    ["secured", 62],
    ["notNeeded", 60],
    ["shortlisted", 58],
    ["searching", 54],
  ] as const)("premises %s → %i", (premises, expected) => {
    expect(score({ premises }).score).toBe(expected);
  });

  it.each([
    ["multiActivityCentre", 62],
    ["integrateExisting", 60],
    ["dedicatedCentre", 58],
    ["exploring", 52],
  ] as const)("intent %s → %i", (intent, expected) => {
    expect(score({ intent }).score).toBe(expected);
  });

  it.each([
    ["over500k", 62],
    ["from150kTo500k", 60],
    ["from50kTo150k", 58],
    ["under50k", 55],
  ] as const)("population %s → %i", (population, expected) => {
    expect(score({ population }).score).toBe(expected);
  });

  it.each([
    ["within6Months", 58],
    ["from6To12Months", 55],
    ["from12To24Months", 49],
    ["undecided", 43],
  ] as const)("horizon %s → %i", (horizon, expected) => {
    expect(score({ horizon }).score).toBe(expected);
  });

  it.each([
    ["industryInsider", 60],
    ["previousVentures", 58],
    ["firstVenture", 53],
  ] as const)("experience %s → %i", (experience, expected) => {
    expect(score({ experience }).score).toBe(expected);
  });

  it.each([
    ["group", 61],
    ["onePartner", 60],
    ["alone", 58],
    ["undecided", 56],
  ] as const)("partners %s → %i", (partners, expected) => {
    expect(score({ partners }).score).toBe(expected);
  });
});

it("counts the existing centre once for a manager who needs no premises", () => {
  expect(
    score({ profile: "leisureCentreManager", premises: "notNeeded" }).score,
  ).toBe(63);
  expect(
    score({ profile: "leisureCentreManager", premises: "secured" }).score,
  ).toBe(70);
  expect(
    score({ profile: "establishedEntrepreneur", premises: "notNeeded" }).score,
  ).toBe(65);
});

describe("knockouts", () => {
  it("caps a contribution under 5k at low priority", () => {
    expect(
      scoreVenueOpeningLead({ ...strongest, contribution: "under5k" }),
    ).toEqual({ score: 34, qualification: "low" });
  });

  it("caps a small contribution with no horizon and no track record", () => {
    const answers: VenueOpeningLeadAnswers = {
      ...strongest,
      contribution: "from5kTo10k",
      horizon: "undecided",
      experience: "firstVenture",
    };

    expect(scoreVenueOpeningLead(answers)).toEqual({
      score: 34,
      qualification: "low",
    });
    expect(
      scoreVenueOpeningLead({ ...answers, experience: "previousVentures" })
        .score,
    ).toBe(61);
  });

  it("caps an exploring lead with no horizon at warm", () => {
    const answers: VenueOpeningLeadAnswers = {
      ...strongest,
      intent: "exploring",
      horizon: "undecided",
    };

    expect(scoreVenueOpeningLead(answers)).toEqual({
      score: 74,
      qualification: "warm",
    });
    expect(
      scoreVenueOpeningLead({ ...answers, contribution: "under5k" }).score,
    ).toBe(34);
  });
});

describe("qualification thresholds", () => {
  it.each([
    [75, "hot", { contribution: "over80k" }],
    [
      74,
      "warm",
      {
        contribution: "over80k",
        intent: "integrateExisting",
        experience: "firstVenture",
        partners: "onePartner",
      },
    ],
    [55, "warm", { population: "under50k" }],
    [54, "nurturing", { premises: "searching" }],
    [
      35,
      "nurturing",
      {
        contribution: "from5kTo10k",
        profile: "other",
        premises: "searching",
        intent: "exploring",
        population: "under50k",
        experience: "firstVenture",
        partners: "group",
      },
    ],
    [
      34,
      "low",
      {
        contribution: "from5kTo10k",
        profile: "other",
        premises: "searching",
        intent: "exploring",
        population: "under50k",
        experience: "firstVenture",
        partners: "onePartner",
      },
    ],
  ] as const)("%i → %s", (expected, qualification, overrides) => {
    expect(score(overrides)).toEqual({ score: expected, qualification });
  });
});
