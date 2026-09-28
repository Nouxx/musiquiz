import type { SanityConfig } from "@repo/utils/sanityConfig";
import { SanityQueryError } from "@repo/utils/sanityQueryError";
import type { z } from "zod";

import { getSanityClient } from "./client";

function formatPath(path: PropertyKey[]) {
  let formatted = "";
  for (const segment of path) {
    if (typeof segment === "number") formatted += `[${segment}]`;
    else formatted += formatted ? `.${String(segment)}` : String(segment);
  }
  return formatted;
}

export function parseSanityData<TSchema extends z.ZodType>({
  queryName,
  schema,
  data,
}: {
  queryName: string;
  schema: TSchema;
  data: unknown;
}): z.infer<TSchema> {
  if (!data) {
    throw new SanityQueryError({ kind: "empty", queryName, issues: [] });
  }

  const result = schema.safeParse(data);

  if (result.success) return result.data;

  const issues = result.error.issues.map((issue) => ({
    path: formatPath(issue.path),
    message: issue.message,
  }));

  // queries wrap their document in a key, so a missing one is { key: null }
  const isMissingDocument = result.error.issues.some(
    (issue) =>
      issue.path.length === 1 &&
      (data as Record<PropertyKey, unknown>)[issue.path[0]!] === null,
  );

  throw new SanityQueryError({
    kind: isMissingDocument ? "empty" : "parse",
    queryName,
    issues,
  });
}

export async function fetchSanityData<TSchema extends z.ZodType>({
  queryName,
  query,
  schema,
  config,
}: {
  queryName: string;
  query: string;
  schema: TSchema;
  config: SanityConfig;
}): Promise<z.infer<TSchema>> {
  const sanityClient = getSanityClient({ config });

  const data: unknown = await sanityClient.fetch(query);

  return parseSanityData({ queryName, schema, data });
}
