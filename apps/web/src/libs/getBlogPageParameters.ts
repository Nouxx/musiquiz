import { getBlogPageData } from "@repo/services/cms/getBlogPageData";

import { blogPageCount } from "./blogPagination";
import { getSanityConfigFromEnvironment } from "./getSanityConfigFromEnvironment";

/** every page but the first, which `/blog/` serves */
export async function getBlogPageParameters() {
  const { articles } = await getBlogPageData({
    config: getSanityConfigFromEnvironment(),
  });

  const count = blogPageCount(articles.length);

  return Array.from({ length: count - 1 }, (_, index) => ({
    params: { page: String(index + 2) },
  }));
}
