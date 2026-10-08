import type { SanityBlogPage } from "@repo/api/sanity/blogPage";

import { getRoutesForLang } from "../../routing/getRoutesForLang";
import type { BlogArticleSummary } from "../types";
import { toCmsImage } from "./toCmsImage";

function toTopic({
  venue,
  event,
}: SanityBlogPage["articles"][number]): BlogArticleSummary["topic"] {
  if (venue) return { kind: "venue", title: venue };
  if (event) return { kind: "event", title: event };
  return undefined;
}

export function toBlogArticleSummary(
  article: SanityBlogPage["articles"][number],
): BlogArticleSummary {
  return {
    title: article.title,
    url: getRoutesForLang("fr").blogArticle(article.slug),
    publishedAt: article.publishedAt,
    topic: toTopic(article),
    cover: toCmsImage(article.cover),
    excerpt: article.excerpt,
  };
}
