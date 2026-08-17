import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

// the game routes exist for the pairs that were authored, and for no others:
// there is no rule saying every venue sells every game (see adr 0010)
function venueGameSlugsQuery() {
  return defineQuery(`*[_type == "venueGame"]
    | order(coalesce(game->displayOrder, 999) asc, game->name asc){
    "venueSlug": venue->slug.current,
    "gameSlug": game->slug.current
  }`);
}

const sanityVenueGameSlugsSchema = z.array(
  z.strictObject({
    venueSlug: z.string().min(1),
    gameSlug: z.string().min(1),
  }),
);

export type SanityVenueGameSlugs = z.infer<typeof sanityVenueGameSlugsSchema>;

export async function fetchVenueGameSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  return fetchSanityData({
    query: venueGameSlugsQuery(),
    schema: sanityVenueGameSlugsSchema,
    config,
  });
}
