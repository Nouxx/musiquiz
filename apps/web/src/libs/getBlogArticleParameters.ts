import { getBlogArticleSlugs } from "@repo/services/cms/getBlogArticleSlugs";

import { getSanityConfigFromEnvironment } from "./getSanityConfigFromEnvironment";

export async function getBlogArticleParameters() {
  const slugs = await getBlogArticleSlugs({
    config: getSanityConfigFromEnvironment(),
  });

  return slugs.map((slug) => ({ params: { slug } }));
}
