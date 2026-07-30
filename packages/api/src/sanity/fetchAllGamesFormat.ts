import type { SanityClient } from "@sanity/client";
import { defineQuery } from "groq";

import { SanityAllGameFormatResponseSchema } from "./schema";

function fetchAllGamesFormatQuery() {
  return defineQuery(`*[_type == "gameFormat"]{
  name,
  "slug": slug.current
}`);
}

export async function fetchAllGamesFormatData({
  sanityClient,
}: {
  sanityClient: SanityClient;
}) {
  const data = await sanityClient.fetch(fetchAllGamesFormatQuery());

  if (!data) throw new Error("No games format data");

  return SanityAllGameFormatResponseSchema.parse(data);
}
