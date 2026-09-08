import { emailTemplateKeys } from "@repo/api/zeptomail/emailTemplateKeys";
import { sendEmailWithTemplate } from "@repo/api/zeptomail/sendEmailWithTemplate";
import z from "zod";

import { buildVenueEmail } from "./buildVenueEmail";
import { buildVenueName } from "./buildVenueName";

export const clientContactFormLimits = {
  firstName: 80,
  mail: 254,
  phone: 30,
  message: 2000,
};

export const clientContactFormBodySchema = z.strictObject({
  // buildVenueEmail turns this into the mailbox the enquiry is sent to, so a
  // slug that is anything but a bare slug lets the request pick the recipient
  venueSlug: z
    .string()
    .max(40)
    .regex(/^[a-z][a-z0-9-]*$/),
  firstName: z.string().min(1).max(clientContactFormLimits.firstName),
  mail: z.email().max(clientContactFormLimits.mail),
  phone: z.string().max(clientContactFormLimits.phone),
  message: z.string().min(1).max(clientContactFormLimits.message),
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

  // the enquiry reaching the venue is the point of the form; the client
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
