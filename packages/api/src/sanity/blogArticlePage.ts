import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { addressProjection, sanityAddressSchema } from "./shared/address";
import {
  articleBodyProjection,
  sanityArticleBodySchema,
} from "./shared/articleBody";
import { imageProjection, sanityImageSchema } from "./shared/image";
import { sanityContentIconSchema } from "./shared/pageComponents";
import {
  sanityRichTextSchema,
  unlocalizedRichTextProjection,
} from "./shared/richText";
import { blogSeoProjection, sanitySeoSchema } from "./shared/seo";
import {
  sanityVenueLinksSchema,
  venueLinksProjection,
} from "./shared/venueLinks";

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
      "seo": ${blogSeoProjection()},
      "body": ${articleBodyProjection({ field: "body" })},
      faq{
        title,
        questions[]{
          question,
          "answer": ${unlocalizedRichTextProjection({ field: "answer" })},
        },
      },
      "venue": venue->{
        title,
        "slug": slug.current,
        "location": location{ lat, lng },
        "address": ${addressProjection},
        googleMapsLink,
        "blog": *[_type == "venueBlog" && venue._ref == ^._id][0]{
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
        },
      },
      "venueLinks": venue->${venueLinksProjection},
      "event": event->{ name, "slug": slug.current },
      "author": author->{
        name,
        "jobTitle": jobTitle[language == "${lang}"][0].value,
        bio,
        tone,
        photo ${imageProjection({ lang })},
        profileUrl,
      },
      "readMore": *[_type == "blogArticle"
        && slug.current != "${slug}"
        && select(
          defined(^.venue) => venue._ref == ^.venue._ref,
          defined(^.event) => event._ref == ^.event._ref,
          true
        )]
        | order(publishedAt desc, _createdAt desc)[0...3]{
        title,
        "slug": slug.current,
        publishedAt,
        "venue": venue->title,
        "event": event->name,
        cover ${imageProjection({ lang })},
        excerpt,
      },
    },
    "publisherLogo": *[_type == "siteSettings"][0].footerLogo ${imageProjection({ lang })},
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
    seo: sanitySeoSchema,
    body: sanityArticleBodySchema,
    faq: z
      .strictObject({
        title: z.string().min(1),
        questions: z
          .array(
            z.strictObject({
              question: z.string().min(1),
              answer: sanityRichTextSchema,
            }),
          )
          .min(3)
          .max(8),
      })
      .nullable(),
    venueLinks: sanityVenueLinksSchema.nullable(),
    venue: z
      .strictObject({
        title: z.string().min(1),
        slug: z.string().min(1),
        location: z.strictObject({ lat: z.number(), lng: z.number() }),
        address: sanityAddressSchema,
        googleMapsLink: z.string().min(1),
        blog: z.strictObject({
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
        }),
      })
      .nullable(),
    event: z
      .strictObject({ name: z.string().min(1), slug: z.string().min(1) })
      .nullable(),
    author: z.strictObject({
      name: z.string().min(1),
      jobTitle: z.string().min(1),
      bio: z.string().min(1),
      tone: z.enum(["blue", "red"]),
      photo: sanityImageSchema,
      profileUrl: z.url().nullable(),
    }),
    readMore: z.array(
      z.strictObject({
        title: z.string().min(1),
        slug: z.string().min(1),
        publishedAt: z.iso.date(),
        venue: z.string().min(1).nullable(),
        event: z.string().min(1).nullable(),
        cover: sanityImageSchema,
        excerpt: z.string().min(1),
      }),
    ),
  }),
  publisherLogo: sanityImageSchema,
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
    queryName: "blogArticlePage",
    query: blogArticlePageQuery({ slug }),
    schema: sanityBlogArticlePageSchema,
    config,
  });
}
