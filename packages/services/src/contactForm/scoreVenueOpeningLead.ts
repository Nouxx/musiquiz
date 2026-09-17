import type { VenueOpeningFormBody } from "./venueOpening";

export type VenueOpeningLeadAnswers = Pick<
  VenueOpeningFormBody,
  | "contribution"
  | "profile"
  | "premises"
  | "intent"
  | "population"
  | "horizon"
  | "experience"
  | "partners"
>;

export const venueOpeningQualificationValues = [
  "hot",
  "warm",
  "nurturing",
  "low",
] as const;

export type VenueOpeningQualification =
  (typeof venueOpeningQualificationValues)[number];

const contributionWeights = {
  over80k: 25,
  from50kTo80k: 20,
  from20kTo50k: 14,
  from10kTo20k: 8,
  from5kTo10k: 3,
  under5k: 0,
} satisfies Record<VenueOpeningLeadAnswers["contribution"], number>;

const profileWeights = {
  leisureCentreManager: 15,
  establishedEntrepreneur: 12,
  investor: 10,
  projectHolder: 7,
  other: 4,
} satisfies Record<VenueOpeningLeadAnswers["profile"], number>;

const premisesWeights = {
  secured: 10,
  notNeeded: 8,
  shortlisted: 6,
  searching: 2,
} satisfies Record<VenueOpeningLeadAnswers["premises"], number>;

const intentWeights = {
  multiActivityCentre: 12,
  integrateExisting: 10,
  dedicatedCentre: 8,
  exploring: 2,
} satisfies Record<VenueOpeningLeadAnswers["intent"], number>;

const populationWeights = {
  over500k: 8,
  from150kTo500k: 6,
  from50kTo150k: 4,
  under50k: 1,
} satisfies Record<VenueOpeningLeadAnswers["population"], number>;

const horizonWeights = {
  within6Months: 15,
  from6To12Months: 12,
  from12To24Months: 6,
  undecided: 0,
} satisfies Record<VenueOpeningLeadAnswers["horizon"], number>;

const experienceWeights = {
  industryInsider: 10,
  previousVentures: 8,
  firstVenture: 3,
} satisfies Record<VenueOpeningLeadAnswers["experience"], number>;

const partnersWeights = {
  group: 5,
  onePartner: 4,
  alone: 2,
  undecided: 0,
} satisfies Record<VenueOpeningLeadAnswers["partners"], number>;

const lowPriorityCap = 34;
const warmCap = 74;

function premisesScore(answers: VenueOpeningLeadAnswers) {
  // a centre manager who needs no premises already scored the centre once
  const isCounted =
    answers.profile === "leisureCentreManager" &&
    answers.premises === "notNeeded";

  return isCounted ? 3 : premisesWeights[answers.premises];
}

function scoreCap(answers: VenueOpeningLeadAnswers) {
  const isLowPriority =
    answers.contribution === "under5k" ||
    (answers.contribution === "from5kTo10k" &&
      answers.horizon === "undecided" &&
      answers.experience === "firstVenture");

  if (isLowPriority) return lowPriorityCap;

  const isWarmAtBest =
    answers.intent === "exploring" && answers.horizon === "undecided";

  return isWarmAtBest ? warmCap : 100;
}

function qualify(score: number): VenueOpeningQualification {
  if (score >= 75) return "hot";
  if (score >= 55) return "warm";
  if (score >= 35) return "nurturing";
  return "low";
}

export function scoreVenueOpeningLead(answers: VenueOpeningLeadAnswers) {
  const raw =
    contributionWeights[answers.contribution] +
    profileWeights[answers.profile] +
    premisesScore(answers) +
    intentWeights[answers.intent] +
    populationWeights[answers.population] +
    horizonWeights[answers.horizon] +
    experienceWeights[answers.experience] +
    partnersWeights[answers.partners];

  const score = Math.min(raw, scoreCap(answers));

  return { score, qualification: qualify(score) };
}
