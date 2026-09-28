import { fetchVenueMailing } from "@repo/api/sanity/venueMailing";
import type { SanityConfig } from "@repo/utils/sanityConfig";

// looked up server side instead of passed through the form body: a request
// could otherwise mail anyone, or pose as another venue, from the venue domain
export async function getVenueMailing({
  sanityConfig,
  venueSlug,
}: {
  sanityConfig: SanityConfig;
  venueSlug: string;
}) {
  try {
    const { venue } = await fetchVenueMailing({
      config: sanityConfig,
      venueSlug,
    });
    return venue;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `No title or owner mails for venue "${venueSlug}" in dataset "${sanityConfig.dataset}", fill them in the Studio.\n${reason}`,
      { cause: error },
    );
  }
}
