import { emailTemplateKeys } from "@repo/api/zeptomail/emailTemplateKeys";
import { sendEmailWithTemplate } from "@repo/api/zeptomail/sendEmailWithTemplate";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import z from "zod";

import { buildVenueName } from "./buildVenueName";
import { getVenueMailing } from "./getVenueMailing";
import { noReplyMail } from "./noReplyMail";
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
  company: z.string().max(quotationFormLimits.company).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  participants: z.string().max(quotationFormLimits.participants),
  budget: z.string().max(quotationFormLimits.budget),
  services: z
    .array(z.string().min(1).max(quotationFormLimits.service))
    .max(quotationFormLimits.services),
  message: z.string().max(quotationFormLimits.message).optional(),
});

type QuotationFormBody = z.infer<typeof quotationFormBodySchema>;

export function adaptQuotationMergeInfo({
  body,
  venueTitle,
}: {
  body: QuotationFormBody;
  venueTitle: string;
}) {
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
    ville: venueTitle,
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
  sanityConfig,
}: {
  body: QuotationFormBody;
  zeptomailToken: string;
  sanityConfig: SanityConfig;
}) {
  const { venueSlug, audience, firstName, mail: clientMail } = body;

  const { title, ownerMails } = await getVenueMailing({
    sanityConfig,
    venueSlug,
  });

  const venueName = buildVenueName(title);

  const mergeInfo = adaptQuotationMergeInfo({ body, venueTitle: title });

  const { internalMailTemplateKey, clientTemplateKey } =
    emailTemplateKeys[audience];

  const [internalResult, clientResult] = await Promise.allSettled([
    sendEmailWithTemplate({
      templateKey: internalMailTemplateKey,
      mergeInfo,
      token: zeptomailToken,
      senderAddress: noReplyMail,
      senderName: venueName,
      destinations: ownerMails.map((ownerMail) => ({
        address: ownerMail,
        name: venueName,
      })),
    }),
    sendEmailWithTemplate({
      templateKey: clientTemplateKey,
      mergeInfo,
      token: zeptomailToken,
      senderAddress: noReplyMail,
      senderName: venueName,
      destinations: [{ address: clientMail, name: firstName }],
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
