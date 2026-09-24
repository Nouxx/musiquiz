import { fetchBlogPage, type SanityBlogPage } from "@repo/api/sanity/blogPage";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { BlogPage } from "./types";
import { toBlogArticleSummary } from "./utils/toBlogArticleSummary";

function adaptBlogPage({ data }: { data: SanityBlogPage }): BlogPage {
  return {
    title: data.page.title,
    intro: data.page.intro,
    articles: data.articles.map((article) => toBlogArticleSummary(article)),
  };
}

export async function getBlogPageData({ config }: { config: SanityConfig }) {
  const data = await fetchBlogPage({ config });

  return adaptBlogPage({ data });
}
