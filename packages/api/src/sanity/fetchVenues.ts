import { type Lang } from "@repo/utils/lang";
import type { SanityClient } from "@sanity/client";
import { defineQuery } from "groq";

import { SanityVenuesResponseSchema } from "./schema";

function fetchVenuesQuery() {
  return defineQuery(`*[_type == "venue"]{
  "title": title,
  "slug": slug.current
}`);
}

export async function fetchVenuesData({
  sanityClient,
}: {
  lang: Lang;
  sanityClient: SanityClient;
}) {
  const data = await sanityClient.fetch(fetchVenuesQuery());

  if (!data) throw new Error("No venues data");

  return SanityVenuesResponseSchema.parse(data);
}
