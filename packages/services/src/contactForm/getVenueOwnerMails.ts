import { fetchVenueOwnerMails } from "@repo/api/sanity/venueOwnerMails";
import type { SanityConfig } from "@repo/utils/sanityConfig";

// looked up server side instead of passed through the form body
// because a recipient list from the request would let anyone mail anyone from the venue domain
export async function getVenueOwnerMails({
  sanityConfig,
  venueSlug,
}: {
  sanityConfig: SanityConfig;
  venueSlug: string;
}) {
  try {
    const { venue } = await fetchVenueOwnerMails({
      config: sanityConfig,
      venueSlug,
    });
    return venue.ownerMails;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `No owner mails for venue "${venueSlug}" in dataset "${sanityConfig.dataset}", fill ownerMails in the Studio.\n${reason}`,
      { cause: error },
    );
  }
}
