import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

// read off the format, not the page: a signature game with no page must fail the build
function globalGameSlugsQuery() {
  return defineQuery(`*[_type == "gameFormat" && signature == true]
    | order(displayOrder asc, name asc).slug.current`);
}

const sanityGlobalGameSlugsSchema = z.array(z.string().min(1));

export type SanityGlobalGameSlugs = z.infer<typeof sanityGlobalGameSlugsSchema>;

export async function fetchGlobalGameSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  return fetchSanityData({
    queryName: "globalGameSlugs",
    query: globalGameSlugsQuery(),
    schema: sanityGlobalGameSlugsSchema,
    config,
  });
}
