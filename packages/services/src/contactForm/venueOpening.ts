import z from "zod";

export const venueOpeningFormLimits = {
  city: 120,
  firstName: 80,
  lastName: 80,
  mail: 254,
  phone: 30,
  message: 2000,
};

export const venueOpeningProfileValues = [
  "projectHolder",
  "establishedEntrepreneur",
  "leisureCentreManager",
  "investor",
  "other",
] as const;

export const venueOpeningIntentValues = [
  "dedicatedCentre",
  "multiActivityCentre",
  "integrateExisting",
  "exploring",
] as const;

export const venueOpeningPopulationValues = [
  "under50k",
  "from50kTo150k",
  "from150kTo500k",
  "over500k",
] as const;

export const venueOpeningPremisesValues = [
  "secured",
  "shortlisted",
  "searching",
  "notNeeded",
] as const;

export const venueOpeningHorizonValues = [
  "within6Months",
  "from6To12Months",
  "from12To24Months",
  "undecided",
] as const;

export const venueOpeningContributionValues = [
  "under5k",
  "from5kTo10k",
  "from10kTo20k",
  "from20kTo50k",
  "from50kTo80k",
  "over80k",
] as const;

export const venueOpeningExperienceValues = [
  "firstVenture",
  "previousVentures",
  "industryInsider",
] as const;

export const venueOpeningPartnersValues = [
  "alone",
  "onePartner",
  "group",
  "undecided",
] as const;

export const venueOpeningSourceValues = [
  "played",
  "recommendation",
  "google",
  "socialMedia",
  "press",
  "event",
  "other",
] as const;

export const venueOpeningFormBodySchema = z.strictObject({
  profile: z.enum(venueOpeningProfileValues),
  intent: z.enum(venueOpeningIntentValues),
  city: z.string().min(1).max(venueOpeningFormLimits.city),
  population: z.enum(venueOpeningPopulationValues),
  premises: z.enum(venueOpeningPremisesValues),
  horizon: z.enum(venueOpeningHorizonValues),
  contribution: z.enum(venueOpeningContributionValues),
  experience: z.enum(venueOpeningExperienceValues),
  partners: z.enum(venueOpeningPartnersValues),
  firstName: z.string().min(1).max(venueOpeningFormLimits.firstName),
  lastName: z.string().min(1).max(venueOpeningFormLimits.lastName),
  mail: z.email().max(venueOpeningFormLimits.mail),
  phone: z.string().min(1).max(venueOpeningFormLimits.phone),
  source: z.enum(venueOpeningSourceValues),
  message: z.string().max(venueOpeningFormLimits.message),
  rgpd: z.literal(true),
});

export type VenueOpeningFormBody = z.infer<typeof venueOpeningFormBodySchema>;
