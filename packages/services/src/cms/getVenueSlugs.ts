import { getSanityClient } from "@repo/api/sanity/client";
import { fetchVenuesData } from "@repo/api/sanity/fetchVenues";
import type { Lang } from "@repo/utils/lang";

export async function getVenueSlugs({
  lang,
  projectId,
  dataset,
  draft,
  token,
}: {
  lang: Lang;
  projectId: string;
  dataset: string;
  draft?: boolean;
  token?: string;
}) {
  const sanityClient = getSanityClient({ projectId, dataset, draft, token });

  const venues = await fetchVenuesData({ lang, sanityClient });
  console.log("venues", venues);

  // todo: throw if empty array

  return venues.map((venue) => venue.slug);
}
