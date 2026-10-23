import { createContact } from "@repo/api/brevo/createContact";
import { emailTemplateKeys } from "@repo/api/zeptomail/emailTemplateKeys";
import { sendEmailWithTemplate } from "@repo/api/zeptomail/sendEmailWithTemplate";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import z from "zod";

import { buildBrevoApiKeyName } from "./buildBrevoApiKeyName";
import { buildVenueName } from "./buildVenueName";
import { getVenueNewsletter } from "./getVenueNewsletter";
import { noReplyMail } from "./noReplyMail";
import { venueSlugSchema } from "./venueSlugSchema";

export const newsletterFormLimits = {
  mail: 254,
};

export const newsletterFormBodySchema = z.strictObject({
  venueSlug: venueSlugSchema,
  mail: z.email().max(newsletterFormLimits.mail),
  rgpd: z.literal(true),
});

type NewsletterFormBody = z.infer<typeof newsletterFormBodySchema>;

type VenueNewsletter = Awaited<ReturnType<typeof getVenueNewsletter>>;

export function pickNewsletterChannel({
  venue,
  venueSlug,
  brevoApiKey,
}: {
  venue: VenueNewsletter;
  venueSlug: string;
  brevoApiKey: string | undefined;
}) {
  if (venue.provider === "zeptomail") {
    return { channel: "zeptomail" as const };
  }

  if (!brevoApiKey) {
    return {
      channel: "zeptomail" as const,
      brevoError: new Error(
        `Venue "${venueSlug}" is on Brevo but the ${buildBrevoApiKeyName(venueSlug)} secret is missing on the worker`,
      ),
    };
  }

  return {
    channel: "brevo" as const,
    apiKey: brevoApiKey,
    listId: venue.brevoListId,
  };
}

async function mailOwners({
  venue,
  mail,
  zeptomailToken,
}: {
  venue: VenueNewsletter;
  mail: string;
  zeptomailToken: string;
}) {
  const venueName = buildVenueName(venue.title);

  await sendEmailWithTemplate({
    templateKey: emailTemplateKeys.newsletter.internalMailTemplateKey,
    mergeInfo: { ville: venue.title, mail },
    token: zeptomailToken,
    senderAddress: noReplyMail,
    senderName: venueName,
    destinations: venue.ownerMails.map((ownerMail) => ({
      address: ownerMail,
      name: venueName,
    })),
  });
}

export async function processNewsletterForm({
  body,
  brevoApiKey,
  zeptomailToken,
  sanityConfig,
}: {
  body: NewsletterFormBody;
  brevoApiKey: string | undefined;
  zeptomailToken: string;
  sanityConfig: SanityConfig;
}) {
  const { venueSlug, mail } = body;

  const venue = await getVenueNewsletter({ sanityConfig, venueSlug });

  const channel = pickNewsletterChannel({ venue, venueSlug, brevoApiKey });

  if (channel.channel === "brevo") {
    try {
      await createContact({
        apiKey: channel.apiKey,
        email: mail,
        listIds: [channel.listId],
        updateEnabled: true,
      });
      return { brevoError: undefined };
    } catch (error) {
      // a sign-up mailed to the owners beats one lost to a revoked key or an outage
      await mailOwners({ venue, mail, zeptomailToken });
      return { brevoError: error };
    }
  }

  await mailOwners({ venue, mail, zeptomailToken });
  return { brevoError: channel.brevoError };
}
