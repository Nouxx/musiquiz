import { fetchVenueOwnerMails } from "@repo/api/sanity/venueOwnerMails";
import { emailTemplateKeys } from "@repo/api/zeptomail/emailTemplateKeys";
import { sendEmailWithTemplate } from "@repo/api/zeptomail/sendEmailWithTemplate";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import z from "zod";

import { buildVenueEmail } from "./buildVenueEmail";
import { buildVenueName } from "./buildVenueName";
import { noReplyMail } from "./noReplyMail";
import { venueSlugSchema } from "./venueSlugSchema";
import { venueTitleSchema } from "./venueTitleSchema";

export const clientContactFormLimits = {
  firstName: 80,
  mail: 254,
  phone: 30,
  message: 2000,
};

export const clientContactFormBodySchema = z.strictObject({
  venueSlug: venueSlugSchema,
  venueTitle: venueTitleSchema,
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
  sanityConfig,
}: {
  body: ClientContactFormBody;
  zeptomailToken: string;
  sanityConfig: SanityConfig;
}) {
  const { venueSlug, venueTitle, firstName, mail: clientMail } = body;

  const venueEmail = buildVenueEmail(venueSlug);
  const venueName = buildVenueName(venueTitle);

  // looked up server side instead of passed through the form body
  // because a recipient list from the request would let anyone mail anyone from the venue domain
  const { venue } = await fetchVenueOwnerMails({
    config: sanityConfig,
    venueSlug,
  });

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
      destinations: venue.ownerMails.map((ownerMail) => ({
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
