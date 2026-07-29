import type { SanityClient } from "@sanity/client";
import { defineQuery } from "groq";

import { SanityHeaderSchema } from "./schema";

function fetchHeaderQuery() {
  return defineQuery(`*[_type == "header"][0]{
  "logo": logo,
}`);
}

export async function fetchHeaderData({
  sanityClient,
}: {
  sanityClient: SanityClient;
}) {
  const data = await sanityClient.fetch(fetchHeaderQuery());

  if (!data) throw new Error("No venues data");

  return SanityHeaderSchema.parse(data);
}
