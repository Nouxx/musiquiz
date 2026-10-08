import {
  fetchBlogArticlePage,
  type SanityBlogArticlePage,
} from "@repo/api/sanity/blogArticlePage";
import type { SanityConfig } from "@repo/utils/sanityConfig";

import type { BlogArticlePage } from "./types";
import { toAddressLine } from "./utils/toAddressLine";
import { toArticleBody } from "./utils/toArticleBody";
import { toBlogArticleSummary } from "./utils/toBlogArticleSummary";
import { toCmsImage } from "./utils/toCmsImage";
import { toReadingMinutes } from "./utils/toReadingMinutes";
import { toRichText } from "./utils/toRichText";
import { toSeo } from "./utils/toSeo";

function toClosesOn({
  venue,
  event,
}: Pick<
  SanityBlogArticlePage["article"],
  "venue" | "event"
>): BlogArticlePage["closesOn"] {
  if (venue) {
    return {
      kind: "venue",
      title: venue.title,
      slug: venue.slug,
      findUs: {
        ...venue.blog.findUs,
        media: toCmsImage(venue.blog.findUs.media),
        venueTitle: venue.title,
        location: venue.location,
        address: toAddressLine(venue.address),
        mapsUrl: venue.googleMapsLink,
      },
    };
  }
  if (event) return { kind: "event", title: event.name, slug: event.slug };
  return { kind: "whereToFindUs" };
}

function adaptBlogArticlePage({
  data,
}: {
  data: SanityBlogArticlePage;
}): BlogArticlePage {
  const { article } = data;
  const { venue, event, author } = article;

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
    closesOn: toClosesOn({ venue, event }),
    author: {
      name: author.name,
      jobTitle: author.jobTitle,
      bio: author.bio,
      tone: author.tone,
      photo: toCmsImage(author.photo),
      profileUrl: author.profileUrl ?? undefined,
    },
    faq: article.faq
      ? {
          title: article.faq.title,
          questions: article.faq.questions.map((question) => ({
            question: question.question,
            answer: toRichText(question.answer),
          })),
        }
      : undefined,
    publisherLogo: toCmsImage(data.publisherLogo),
    readMore: article.readMore.map((item) => toBlogArticleSummary(item)),
    seo: toSeo({
      data: article.seo,
      fallback: { title: article.title, description: article.excerpt },
    }),
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
