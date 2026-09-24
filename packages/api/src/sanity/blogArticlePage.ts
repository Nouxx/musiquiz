import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import {
  articleBodyProjection,
  sanityArticleBodySchema,
} from "./shared/articleBody";
import { imageProjection, sanityImageSchema } from "./shared/image";
import { sanityContentIconSchema } from "./shared/pageComponents";
import {
  unlocalizedRichTextProjection,
  sanityRichTextSchema,
} from "./shared/richText";

const lang = "fr";

function blogArticlePageQuery({ slug }: { slug: string }) {
  return defineQuery(`{
    "article": *[_type == "blogArticle" && slug.current == "${slug}"][0]{
      title,
      publishedAt,
      updatedAt,
      excerpt,
      cover ${imageProjection({ lang })},
      "summary": ${unlocalizedRichTextProjection({ field: "summary" })},
      chips[]{ icon, label },
      reviewCount,
      "body": ${articleBodyProjection({ field: "body" })},
      "venue": venue->{
        title,
        "slug": slug.current,
        "location": location{ lat, lng },
        addressLine,
        googleMapsLink,
      },
      "author": author->{
        name,
        "jobTitle": jobTitle[language == "${lang}"][0].value,
        bio,
        tone,
        photo ${imageProjection({ lang })},
      },
      "venueBlog": *[_type == "venueBlog" && venue._ref == ^.venue._ref][0]{
        findUs{
          media ${imageProjection({ lang })},
          badge,
          title,
          addressNote,
          openingTitle,
          openingNote,
          contactTitle,
          contactNote,
        },
        faq{
          title,
          questions[]{
            question,
            "answer": ${unlocalizedRichTextProjection({ field: "answer" })},
          },
        },
      },
      "readMore": *[_type == "blogArticle"
        && venue._ref == ^.venue._ref
        && slug.current != "${slug}"]
        | order(publishedAt desc, _createdAt desc)[0...3]{
        title,
        "slug": slug.current,
        publishedAt,
        "venue": venue->title,
        cover ${imageProjection({ lang })},
        excerpt,
      },
    }
  }`);
}

const sanityBlogArticlePageSchema = z.strictObject({
  article: z.strictObject({
    title: z.string().min(1),
    publishedAt: z.iso.date(),
    updatedAt: z.iso.date().nullable(),
    excerpt: z.string().min(1),
    cover: sanityImageSchema,
    summary: sanityRichTextSchema,
    chips: z
      .array(
        z.strictObject({
          icon: sanityContentIconSchema,
          label: z.string().min(1),
        }),
      )
      .nullable(),
    reviewCount: z.number().int().positive().nullable(),
    body: sanityArticleBodySchema,
    venue: z.strictObject({
      title: z.string().min(1),
      slug: z.string().min(1),
      location: z.strictObject({ lat: z.number(), lng: z.number() }),
      addressLine: z.string().min(1),
      googleMapsLink: z.string().min(1),
    }),
    author: z.strictObject({
      name: z.string().min(1),
      jobTitle: z.string().min(1),
      bio: z.string().min(1),
      tone: z.enum(["blue", "red"]),
      photo: sanityImageSchema,
    }),
    venueBlog: z.strictObject({
      findUs: z.strictObject({
        media: sanityImageSchema,
        badge: z.string().min(1),
        title: z.string().min(1),
        addressNote: z.string().min(1),
        openingTitle: z.string().min(1),
        openingNote: z.string().min(1),
        contactTitle: z.string().min(1),
        contactNote: z.string().min(1),
      }),
      faq: z.strictObject({
        title: z.string().min(1),
        questions: z
          .array(
            z.strictObject({
              question: z.string().min(1),
              answer: sanityRichTextSchema,
            }),
          )
          .min(1),
      }),
    }),
    readMore: z.array(
      z.strictObject({
        title: z.string().min(1),
        slug: z.string().min(1),
        publishedAt: z.iso.date(),
        venue: z.string().min(1),
        cover: sanityImageSchema,
        excerpt: z.string().min(1),
      }),
    ),
  }),
});

export type SanityBlogArticlePage = z.infer<typeof sanityBlogArticlePageSchema>;

export async function fetchBlogArticlePage({
  config,
  slug,
}: {
  config: SanityConfig;
  slug: string;
}) {
  return fetchSanityData({
    query: blogArticlePageQuery({ slug }),
    schema: sanityBlogArticlePageSchema,
    config,
  });
}
