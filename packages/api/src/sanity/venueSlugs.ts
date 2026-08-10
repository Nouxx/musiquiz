import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

function venueSlugsQuery() {
  return defineQuery(`*[_type == "venue"]{
    "slug": slug.current
  }`);
}

const sanityVenueSlugsSchema = z.array(z.strictObject({ slug: z.string() }));

export type SanityVenueSlugs = z.infer<typeof sanityVenueSlugsSchema>;

export async function fetchVenueSlugs({ config }: { config: SanityConfig }) {
  return fetchSanityData({
    query: venueSlugsQuery(),
    schema: sanityVenueSlugsSchema,
    config,
  });
}
