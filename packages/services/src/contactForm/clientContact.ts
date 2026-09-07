import { emailTemplateKeys } from "@repo/api/zeptomail/emailTemplateKeys";
import { sendEmailWithTemplate } from "@repo/api/zeptomail/sendEmailWithTemplate";
import z from "zod";

import { buildVenueEmail } from "./buildVenueEmail";
import { buildVenueName } from "./buildVenueName";

export const clientContactFormBodySchema = z.strictObject({
  venueSlug: z.string().min(1),
  firstName: z.string().min(1),
  mail: z.email(),
  phone: z.string(),
  message: z.string(),
});

type ClientContactFormBody = z.infer<typeof clientContactFormBodySchema>;

export function adaptClientContactFormMergeInfo(body: ClientContactFormBody) {
  const { firstName, mail, phone, message } = body;

  return {
    prenom: firstName,
    email: mail,
    telephone: phone,
    message,
  };
}

export async function processClientContactForm({
  body,
  zeptomailToken,
}: {
  body: ClientContactFormBody;
  zeptomailToken: string;
}) {
  const { venueSlug, firstName, mail: clientMail } = body;

  const venueEmail = buildVenueEmail(venueSlug);
  const venueName = buildVenueName(venueSlug);

  const mergeInfo = adaptClientContactFormMergeInfo(body);

  const { internalMailTemplateKey, clientTemplateKey } =
    emailTemplateKeys.clientContact;

  await Promise.all([
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
}
