import type { BlogArticlePage } from "@repo/services/cms/types";

import { getBlogId } from "./getBlogId";
import { getOrganizationId } from "./getOrganizationId";
import { getVenueBusinessId } from "./getVenueBusinessId";

export function toBlogPosting({
  site,
  url,
  imageUrl,
  article,
}: {
  site: URL;
  url: string;
  imageUrl: string;
  article: Pick<
    BlogArticlePage,
    "title" | "excerpt" | "publishedAt" | "updatedAt" | "readingMinutes"
  > & {
    closesOn:
      { kind: "venue"; slug: string } | { kind: "event" | "whereToFindUs" };
    author: Pick<BlogArticlePage["author"], "name" | "jobTitle" | "profileUrl">;
  };
}) {
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.excerpt,
    image: imageUrl,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: "fr",
    timeRequired: `PT${article.readingMinutes}M`,
    mainEntityOfPage: url,
    isPartOf: { "@id": getBlogId(site) },
    ...(article.closesOn.kind === "venue" && {
      about: { "@id": getVenueBusinessId(site, article.closesOn.slug) },
    }),
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.jobTitle,
      ...(article.author.profileUrl && { sameAs: [article.author.profileUrl] }),
    },
    publisher: { "@id": getOrganizationId(site) },
  };
}
