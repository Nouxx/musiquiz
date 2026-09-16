import { emailTemplateKeys } from "@repo/api/zeptomail/emailTemplateKeys";
import { sendEmailWithTemplate } from "@repo/api/zeptomail/sendEmailWithTemplate";
import { venueOpeningMergeLabels } from "@repo/api/zeptomail/venueOpeningMergeLabels";
import z from "zod";

// anchor the page cover CTA scrolls to
export const venueOpeningFormId = "venue-opening-form";

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

// the page belongs to no venue, so the lead goes to the network address
const venueOpeningEmail = "contact@musiquiz.co";
const venueOpeningName = "Musi'Quiz";

// keys are the client's merge tags; lead_score and lead_qualification wait on
// the weights the client never sent
export function adaptVenueOpeningMergeInfo(body: VenueOpeningFormBody) {
  const labels = venueOpeningMergeLabels;

  return {
    profil: labels.profile[body.profile],
    intention: labels.intent[body.intent],
    ville_projet: body.city,
    population: labels.population[body.population],
    local: labels.premises[body.premises],
    horizon: labels.horizon[body.horizon],
    apport: labels.contribution[body.contribution],
    experience: labels.experience[body.experience],
    associes: labels.partners[body.partners],
    prenom: body.firstName,
    nom: body.lastName,
    email: body.mail,
    telephone: body.phone,
    source: labels.source[body.source],
    message: body.message,
    rgpd: "Oui",
  };
}

export async function processVenueOpeningForm({
  body,
  zeptomailToken,
}: {
  body: VenueOpeningFormBody;
  zeptomailToken: string;
}) {
  const { firstName, mail: applicantMail } = body;

  const mergeInfo = adaptVenueOpeningMergeInfo(body);

  const { internalMailTemplateKey, clientTemplateKey } =
    emailTemplateKeys.venueOpening;

  const [internalResult, applicantResult] = await Promise.allSettled([
    sendEmailWithTemplate({
      templateKey: internalMailTemplateKey,
      mergeInfo,
      token: zeptomailToken,
      senderAddress: venueOpeningEmail,
      senderName: venueOpeningName,
      destinationAddress: venueOpeningEmail,
      destinationName: venueOpeningName,
    }),
    sendEmailWithTemplate({
      templateKey: clientTemplateKey,
      mergeInfo,
      token: zeptomailToken,
      senderAddress: venueOpeningEmail,
      senderName: venueOpeningName,
      destinationAddress: applicantMail,
      destinationName: firstName,
    }),
  ]);

  // the lead reaching the network is the point of the form; the applicant
  // confirmation is a courtesy, and failing the request over it invites a
  // duplicate send
  if (internalResult.status === "rejected") {
    throw internalResult.reason;
  }

  return {
    confirmationError:
      applicantResult.status === "rejected"
        ? applicantResult.reason
        : undefined,
  };
}
