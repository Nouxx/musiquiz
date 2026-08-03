import { fetchSanityData } from "@repo/api/sanity/fetchData";
import { fetchHeaderQuery } from "@repo/api/sanity/queries";
import { SanityHeaderSchema } from "@repo/api/sanity/schema";
import type { SanityHeader } from "@repo/api/sanity/types";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { Header } from "./types";

function adaptHeader(data: SanityHeader): Header {
  return {
    logo: data.headerLogo,
  };
}

export async function getHeaderData({ config }: { config: SanityConfig }) {
  const data = await fetchSanityData({
    query: fetchHeaderQuery(),
    schema: SanityHeaderSchema,
    config,
  });

  return adaptHeader(data);
}
