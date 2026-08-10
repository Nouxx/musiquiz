import type { SanityConfig } from "@repo/utils/sanityConfig";
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
}): Promise<z.infer<TSchema>> {
  const sanityClient = getSanityClient({ config });

  const data = await sanityClient.fetch(query);

  if (!data) throw new Error(`No data returned for query: ${query}`);

  return schema.parse(data);
}
