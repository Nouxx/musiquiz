import type { BlogArticleSummary } from "@repo/services/cms/types";
import type { ArticleCardItem } from "@repo/ui/types";

import { getT } from "./i18n";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatBlogDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

export function toArticleCard(article: BlogArticleSummary): ArticleCardItem {
  return {
    media: article.cover,
    badge: article.venue,
    title: article.title,
    body: article.excerpt,
    cta: { label: getT("fr")("blogPage.readArticle"), url: article.url },
    date: {
      label: formatBlogDate(article.publishedAt),
      iso: article.publishedAt,
    },
  };
}
