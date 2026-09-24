import {
  fetchBlogArticlePage,
  type SanityBlogArticlePage,
} from "@repo/api/sanity/blogArticlePage";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { BlogArticlePage } from "./types";
import { toArticleBody } from "./utils/toArticleBody";
import { toBlogArticleSummary } from "./utils/toBlogArticleSummary";
import { toCmsImage } from "./utils/toCmsImage";
import { toReadingMinutes } from "./utils/toReadingMinutes";
import { toRichText } from "./utils/toRichText";

function adaptBlogArticlePage({
  data,
}: {
  data: SanityBlogArticlePage;
}): BlogArticlePage {
  const { article } = data;
  const { venue, author, venueBlog } = article;

  const summary = toRichText(article.summary);
  const body = toArticleBody(article.body);

  return {
    title: article.title,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt ?? undefined,
    cover: toCmsImage(article.cover),
    summary,
    chips: article.chips ?? [],
    reviewCount: article.reviewCount ?? undefined,
    body,
    readingMinutes: toReadingMinutes([...summary, ...body]),
    venue: { title: venue.title, slug: venue.slug },
    author: {
      name: author.name,
      jobTitle: author.jobTitle,
      bio: author.bio,
      tone: author.tone,
      photo: toCmsImage(author.photo),
    },
    findUs: {
      ...venueBlog.findUs,
      media: toCmsImage(venueBlog.findUs.media),
      venueTitle: venue.title,
      location: venue.location,
      address: venue.addressLine,
      mapsUrl: venue.googleMapsLink,
    },
    faq: {
      title: venueBlog.faq.title,
      questions: venueBlog.faq.questions.map((question) => ({
        question: question.question,
        answer: toRichText(question.answer),
      })),
    },
    readMore: article.readMore.map((item) => toBlogArticleSummary(item)),
  };
}

export async function getBlogArticlePageData({
  config,
  slug,
}: {
  config: SanityConfig;
  slug: string;
}) {
  const data = await fetchBlogArticlePage({ config, slug });

  return adaptBlogArticlePage({ data });
}
