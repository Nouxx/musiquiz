import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

function venueCustomPageSlugsQuery() {
  return defineQuery(`*[_type == "venueCustomPage"]
    | order(slug.current asc){
    "venueSlug": venue->slug.current,
    "pageSlug": slug.current,
    "title": title[language == "fr"][0].value
  }`);
}

const sanityVenueCustomPageSlugsSchema = z.array(
  z.strictObject({
    venueSlug: z.string().min(1),
    pageSlug: z.string().min(1),
    title: z.string().min(1),
  }),
);

export type SanityVenueCustomPageSlugs = z.infer<
  typeof sanityVenueCustomPageSlugsSchema
>;

export async function fetchVenueCustomPageSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  return fetchSanityData({
    queryName: "venueCustomPageSlugs",
    query: venueCustomPageSlugsQuery(),
    schema: sanityVenueCustomPageSlugsSchema,
    config,
  });
}
