import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { pageCoverProjection, sanityPageCoverSchema } from "./shared/pageCover";
import { richTextProjection, sanityRichTextSchema } from "./shared/richText";

function termsAndConditionsPageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "page": *[_type == "termsAndConditionsPage"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "intro": ${richTextProjection({ field: "intro", lang })},
    },
    "venues": *[_type == "venue"] | order(title asc){
      title,
      "slug": slug.current,
      "terms": terms[]{
        "title": title[language == "${lang}"][0].value,
        "body": ${richTextProjection({ field: "body", lang })},
      },
    },
  }`);
}

const sanityTermsAndConditionsPageSchema = z.strictObject({
  page: z.strictObject({
    pageCover: sanityPageCoverSchema({ hasCta: false }),
    intro: sanityRichTextSchema,
  }),
  venues: z
    .array(
      z.strictObject({
        title: z.string().min(1),
        slug: z.string().min(1),
        terms: z
          .array(
            z.strictObject({
              title: z.string().min(1),
              body: sanityRichTextSchema,
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

export type SanityTermsAndConditionsPage = z.infer<
  typeof sanityTermsAndConditionsPageSchema
>;

export async function fetchTermsAndConditionsPage({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  return fetchSanityData({
    query: termsAndConditionsPageQuery({ lang }),
    schema: sanityTermsAndConditionsPageSchema,
    config,
  });
}
