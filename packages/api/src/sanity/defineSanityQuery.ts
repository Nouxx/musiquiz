import type { SanityConfig } from "@repo/utils/sanityConfig";
import type { z } from "zod";

import { getSanityClient } from "./client";

/**
 * GROQ params a Query Module declares. Values are always strings — a param is
 * a lang or a slug, never a structure.
 */
type QueryParameters = Record<string, string>;

/**
 * Binds a GROQ query to the schema that parses its response and to the params
 * the query reads, and returns the fetch function a Query Module exports.
 *
 * Curried because TypeScript cannot infer `TSchema` while `TQueryParameters` is
 * supplied explicitly, and `TQueryParameters` cannot be inferred at all — it is
 * declared, not read from a value. Call it as
 * `defineSanityQuery<Parameters>()({ query, schema })`.
 */
export function defineSanityQuery<
  TQueryParameters extends QueryParameters = Record<never, never>,
>() {
  return function bindSchema<TSchema extends z.ZodType>({
    query,
    schema,
  }: {
    query: string;
    schema: TSchema;
  }) {
    return async function fetchSanityData(
      input: TQueryParameters & { config: SanityConfig },
    ): Promise<z.infer<TSchema>> {
      const { config, ...rest } = input;

      // the client's params overload is conditional on its own generic, which
      // cannot resolve against ours — widening to the concrete type settles it
      const parameters: QueryParameters = rest;

      const sanityClient = getSanityClient({ config });
      const data = await sanityClient.fetch(query, parameters);

      if (!data) throw new Error(`No data returned for query: ${query}`);

      return schema.parse(data);
    };
  };
}
