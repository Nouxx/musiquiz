import { fetchBlogPage, type SanityBlogPage } from "@repo/api/sanity/blogPage";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import { getRoutesForLang } from "../routing/getRoutesForLang";
import type { BlogArticleSummary, BlogPage } from "./types";
import { toCmsImage } from "./utils/toCmsImage";

function toBlogArticleSummary(
  article: SanityBlogPage["articles"][number],
): BlogArticleSummary {
  return {
    title: article.title,
    url: getRoutesForLang("fr").blogArticle(article.slug),
    publishedAt: article.publishedAt,
    venue: article.venue,
    cover: toCmsImage(article.cover),
    excerpt: article.excerpt,
  };
}

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
