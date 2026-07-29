import type { Lang } from "@repo/utils/lang";
import type { SanityClient } from "@sanity/client";
import { defineQuery } from "groq";

import { SanityHomepageSchema } from "./schema";

function fetchHomepageQuery(lang: Lang) {
  return defineQuery(`*[_type == "homepage"][0]{
  logo,
  "badge": badge[language == "${lang}"][0].value,
  "heading": heading[language == "${lang}"][0].value,
}`);
}

export async function fetchHomepageData({
  lang,
  sanityClient,
}: {
  lang: Lang;
  sanityClient: SanityClient;
}) {
  const data = await sanityClient.fetch(fetchHomepageQuery(lang));

  if (!data) throw new Error("No homepage data");

  return SanityHomepageSchema.parse(data);
}
