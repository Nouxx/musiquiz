import type { SanityConfig } from "@repo/utils/sanityConfig";

import { toBlogUrls } from "../routing/siteUrls";
import { getBlogArticleSlugs } from "./getBlogArticleSlugs";

export async function getBlogSiteUrls({ config }: { config: SanityConfig }) {
  const articleSlugs = await getBlogArticleSlugs({ config });

  return toBlogUrls({ articleSlugs });
}
