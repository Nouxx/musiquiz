import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

function blogArticleSlugsQuery() {
  return defineQuery(`*[_type == "blogArticle"].slug.current`);
}

const sanityBlogArticleSlugsSchema = z.array(z.string().min(1));

export type SanityBlogArticleSlugs = z.infer<
  typeof sanityBlogArticleSlugsSchema
>;

export async function fetchBlogArticleSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  return fetchSanityData({
    query: blogArticleSlugsQuery(),
    schema: sanityBlogArticleSlugsSchema,
    config,
  });
}
