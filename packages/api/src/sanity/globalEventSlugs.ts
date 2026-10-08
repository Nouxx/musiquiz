import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

// read off the format, not the page: an event with no page must fail the build
function globalEventSlugsQuery() {
  return defineQuery(`*[_type == "eventFormat"]
    | order(displayOrder asc, name asc).slug.current`);
}

const sanityGlobalEventSlugsSchema = z.array(z.string().min(1));

export type SanityGlobalEventSlugs = z.infer<
  typeof sanityGlobalEventSlugsSchema
>;

export async function fetchGlobalEventSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  return fetchSanityData({
    queryName: "globalEventSlugs",
    query: globalEventSlugsQuery(),
    schema: sanityGlobalEventSlugsSchema,
    config,
  });
}
