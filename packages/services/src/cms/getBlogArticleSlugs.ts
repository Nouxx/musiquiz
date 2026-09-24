import { fetchBlogArticleSlugs } from "@repo/api/sanity/blogArticleSlugs";
import type { SanityConfig } from "@repo/utils/sanityConfig";

export async function getBlogArticleSlugs({
  config,
}: {
  config: SanityConfig;
}) {
  return fetchBlogArticleSlugs({ config });
}
