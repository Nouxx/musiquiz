import { getSanityClient } from "@repo/api/sanity/client";
import { fetchHeaderData } from "@repo/api/sanity/fetchHeader";
import { type SanityHeader } from "@repo/api/sanity/types";

import type { Header } from "./types";

function adaptHeader(data: SanityHeader): Header {
  return {
    logo: data.logo,
  };
}

export async function getHeaderData({
  projectId,
  dataset,
  draft,
  token,
}: {
  projectId: string;
  dataset: string;
  draft?: boolean;
  token?: string;
}) {
  const sanityClient = getSanityClient({ projectId, dataset, draft, token });

  const header = await fetchHeaderData({ sanityClient });

  return adaptHeader(header);
}
