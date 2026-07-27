import { getSanityClient } from "@repo/api/sanity/client";
import { fetchHomepageData } from "@repo/api/sanity/fetchHomepageData";
import { type SanityHomepage } from "@repo/api/sanity/types";
import { type Lang } from "@repo/utils/lang";

import { type Homepage } from "./types";

function adaptHomepage(data: SanityHomepage): Homepage {
  return {
    heading: data.heading,
  };
}

export async function getHomepageData({
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

  const sanityHomepage = await fetchHomepageData({ lang, sanityClient });

  return adaptHomepage(sanityHomepage);
}
