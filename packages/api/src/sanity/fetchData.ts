import type { SanityConfig } from "@repo/utils/sanityConfig";
import type { z } from "zod";

import { getSanityClient } from "./client";

/**
 * GROQ params a query reads. Values are always strings — a param is a lang or
 * a slug, never a structure.
 */
type QueryParameters = Record<string, string>;

export async function fetchSanityData<TSchema extends z.ZodType>({
  query,
  schema,
  parameters = {},
  config,
}: {
  query: string;
  schema: TSchema;
  parameters?: QueryParameters;
  config: SanityConfig;
}): Promise<z.infer<TSchema>> {
  const sanityClient = getSanityClient({ config });

  const data = await sanityClient.fetch(query, parameters);

  if (!data) throw new Error(`No data returned for query: ${query}`);

  return schema.parse(data);
}
