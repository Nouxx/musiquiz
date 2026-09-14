import { emailTemplateKeys } from "@repo/api/zeptomail/emailTemplateKeys";
import { sendEmailWithTemplate } from "@repo/api/zeptomail/sendEmailWithTemplate";
import z from "zod";

import { buildVenueEmail } from "./buildVenueEmail";
import { buildVenueName } from "./buildVenueName";
import { venueSlugSchema } from "./venueSlugSchema";

export const quotationFormLimits = {
  lastName: 80,
  firstName: 80,
  mail: 254,
  phone: 30,
  company: 120,
  participants: 40,
  budget: 60,
  message: 2000,
  service: 200,
  services: 20,
};

export const quotationFormBodySchema = z.strictObject({
  venueSlug: venueSlugSchema,
  // picks the mail template only; the recipient comes from the venue slug
  audience: z.enum(["teamBuilding", "musiTeens"]),
  lastName: z.string().min(1).max(quotationFormLimits.lastName),
  firstName: z.string().min(1).max(quotationFormLimits.firstName),
  mail: z.email().max(quotationFormLimits.mail),
  phone: z.string().max(quotationFormLimits.phone),
  company: z.string().max(quotationFormLimits.company),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  participants: z.string().max(quotationFormLimits.participants),
  budget: z.string().max(quotationFormLimits.budget),
  services: z
    .array(z.string().min(1).max(quotationFormLimits.service))
    .max(quotationFormLimits.services),
  message: z.string().min(1).max(quotationFormLimits.message),
});

type QuotationFormBody = z.infer<typeof quotationFormBodySchema>;

// todo: check with Lionel
export function adaptQuotationMergeInfo(body: QuotationFormBody) {
  const {
    lastName,
    firstName,
    mail,
    phone,
    company,
    date,
    time,
    participants,
    budget,
    services,
    message,
  } = body;

  return {
    prenom: firstName,
    nom: lastName,
    email: mail,
    telephone: phone,
    societe: company,
    date,
    heure: time,
    nb_participants: participants,
    budget, // todo: present in Figma, not in Zeptomail
    prestations: services.join(", "),
    message,
  };
}

export async function processQuotationForm({
  body,
  zeptomailToken,
}: {
  body: QuotationFormBody;
  zeptomailToken: string;
}) {
  const { venueSlug, audience, firstName, mail: clientMail } = body;

  const venueEmail = buildVenueEmail(venueSlug);
  const venueName = buildVenueName(venueSlug);

  const mergeInfo = adaptQuotationMergeInfo(body);

  const { internalMailTemplateKey, clientTemplateKey } =
    emailTemplateKeys[audience];

  const [internalResult, clientResult] = await Promise.allSettled([
    sendEmailWithTemplate({
      templateKey: internalMailTemplateKey,
      mergeInfo,
      token: zeptomailToken,
      senderAddress: venueEmail,
      senderName: venueName,
      destinationAddress: venueEmail,
      destinationName: venueName,
    }),
    sendEmailWithTemplate({
      templateKey: clientTemplateKey,
      mergeInfo,
      token: zeptomailToken,
      senderAddress: venueEmail,
      senderName: venueName,
      destinationAddress: clientMail,
      destinationName: firstName,
    }),
  ]);

  // the request reaching the venue is the point of the form; the client
  // confirmation is a courtesy, and failing the request over it invites a
  // duplicate send
  if (internalResult.status === "rejected") {
    throw internalResult.reason;
  }

  return {
    confirmationError:
      clientResult.status === "rejected" ? clientResult.reason : undefined,
  };
}
