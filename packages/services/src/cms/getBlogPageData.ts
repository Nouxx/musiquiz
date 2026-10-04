import { fetchBlogPage, type SanityBlogPage } from "@repo/api/sanity/blogPage";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { BlogPage } from "./types";
import { toBlogArticleSummary } from "./utils/toBlogArticleSummary";
import { toSeo } from "./utils/toSeo";

function adaptBlogPage({ data }: { data: SanityBlogPage }): BlogPage {
  return {
    title: data.page.title,
    intro: data.page.intro,
    articles: data.articles.map((article) => toBlogArticleSummary(article)),
    seo: toSeo({
      data: data.page.seo,
      fallback: { title: data.page.title, description: data.page.intro },
    }),
  };
}

export async function getBlogPageData({ config }: { config: SanityConfig }) {
  const data = await fetchBlogPage({ config });

  return adaptBlogPage({ data });
}
