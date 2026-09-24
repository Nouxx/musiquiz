import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";

const lang = "fr";

function blogPageQuery() {
  return defineQuery(`{
    "page": *[_type == "blogPage"][0]{
      title,
      intro,
    },
    "articles": *[_type == "blogArticle"] | order(publishedAt desc, _createdAt desc){
      title,
      "slug": slug.current,
      publishedAt,
      "venue": venue->title,
      cover ${imageProjection({ lang })},
      excerpt,
    }
  }`);
}

const sanityBlogPageSchema = z.strictObject({
  page: z.strictObject({
    title: z.string().min(1),
    intro: z.string().min(1),
  }),
  articles: z.array(
    z.strictObject({
      title: z.string().min(1),
      slug: z.string().min(1),
      publishedAt: z.iso.date(),
      venue: z.string().min(1),
      cover: sanityImageSchema,
      excerpt: z.string().min(1),
    }),
  ),
});

export type SanityBlogPage = z.infer<typeof sanityBlogPageSchema>;

export async function fetchBlogPage({ config }: { config: SanityConfig }) {
  return fetchSanityData({
    query: blogPageQuery(),
    schema: sanityBlogPageSchema,
    config,
  });
}
