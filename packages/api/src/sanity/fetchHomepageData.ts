import { type Lang } from "@repo/utils/lang";
import type { SanityClient } from "@sanity/client";
import { defineQuery } from "groq";

import { SanityHomepageSchema } from "./schema";

function getHomepageQuery(lang: Lang) {
  return defineQuery(`*[_type == "homepage"][0]{
  "heading": heading[language == "${lang}"][0].value
}`);
}

export async function fetchHomepageData({
  lang,
  sanityClient,
}: {
  lang: Lang;
  sanityClient: SanityClient;
}) {
  const homepageQuery = getHomepageQuery(lang);

  const data = await sanityClient.fetch(homepageQuery);

  if (!data) throw new Error("No homepage data");

  return SanityHomepageSchema.parse(data);
}
