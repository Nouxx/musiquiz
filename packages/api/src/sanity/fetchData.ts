import { frenchTypography } from "@repo/utils/frenchTypography";
import type { Lang } from "@repo/utils/lang";
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

function applyTypography<T>(value: T): T {
  if (typeof value === "string") return frenchTypography(value) as T;
  if (Array.isArray(value))
    return value.map((item) => applyTypography(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        applyTypography(entry),
      ]),
    ) as T;
  }
  return value;
}

export function parseSanityData<TSchema extends z.ZodType>({
  queryName,
  schema,
  data,
  lang,
}: {
  queryName: string;
  schema: TSchema;
  data: unknown;
  lang?: Lang;
}): z.infer<TSchema> {
  if (!data) {
    throw new SanityQueryError({ kind: "empty", queryName, issues: [] });
  }

  const result = schema.safeParse(data);

  if (result.success) {
    return lang === "fr" ? applyTypography(result.data) : result.data;
  }

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
  lang,
}: {
  queryName: string;
  query: string;
  schema: TSchema;
  config: SanityConfig;
  lang?: Lang;
}): Promise<z.infer<TSchema>> {
  const sanityClient = getSanityClient({ config });

  const data: unknown = await sanityClient.fetch(query);

  return parseSanityData({ queryName, schema, data, lang });
}
