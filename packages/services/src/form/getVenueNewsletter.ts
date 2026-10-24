import { fetchVenueNewsletter } from "@repo/api/sanity/venueNewsletter";
import type { SanityConfig } from "@repo/utils/sanityConfig";

export async function getVenueNewsletter({
  sanityConfig,
  venueSlug,
}: {
  sanityConfig: SanityConfig;
  venueSlug: string;
}) {
  try {
    const { venue } = await fetchVenueNewsletter({
      config: sanityConfig,
      venueSlug,
    });
    return venue;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `No title, owner mails or newsletter provider for venue "${venueSlug}" in dataset "${sanityConfig.dataset}", fill them in the Studio.\n${reason}`,
      { cause: error },
    );
  }
}
