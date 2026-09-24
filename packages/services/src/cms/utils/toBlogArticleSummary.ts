import type { SanityBlogPage } from "@repo/api/sanity/blogPage";

import { getRoutesForLang } from "../../routing/getRoutesForLang";
import type { BlogArticleSummary } from "../types";
import { toCmsImage } from "./toCmsImage";

export function toBlogArticleSummary(
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
