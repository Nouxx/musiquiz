import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import type { z } from "zod";

import { getSanityClient } from "./client";

export async function fetchSanityData<TSchema extends z.ZodType>({
  query,
  schema,
  config,
}: {
  query: string;
  schema: TSchema;
  config: SanityConfig;
}) {
  const sanityClient = getSanityClient({ config });
  const sanityQuery = defineQuery(query);

  const data = await sanityClient.fetch(sanityQuery);

  if (!data) throw new Error(`No data returned for query: ${query}`);

  return schema.parse(data);
}
