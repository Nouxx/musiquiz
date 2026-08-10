import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";
import {
  pageComponentsProjection,
  sanityPageComponentSchema,
} from "./shared/pageComponents";

function homepageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "homepage": *[_type == "homepage"][0]{
      "badge": badge[language == "${lang}"][0].value,
      "heading": heading[language == "${lang}"][0].value,
      logo ${imageProjection({ lang })},
      cover ${imageProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ lang })},
    },
    "venues": *[_type == "venue"]{
      "title": title,
      "slug": slug.current,
      regionCode
    },
  }`);
}

const sanityHomepageSchema = z.strictObject({
  homepage: z.strictObject({
    badge: z.string().min(1),
    heading: z.string().min(1),
    logo: sanityImageSchema,
    cover: sanityImageSchema,
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
  venues: z.array(
    z.strictObject({
      title: z.string(),
      slug: z.string(),
      regionCode: z.string(),
    }),
  ),
});

export type SanityHomepage = z.infer<typeof sanityHomepageSchema>;

export async function fetchHomepage({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  return fetchSanityData({
    query: homepageQuery({ lang }),
    schema: sanityHomepageSchema,
    config,
  });
}
