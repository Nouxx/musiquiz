import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { optionalCtaProjection, sanityCtaSchema } from "./shared/cta";
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
      "venuesCta": ${optionalCtaProjection({ field: "venuesCta", lang })},
    },
    "venues": *[_type == "venue"] | order(title asc){
      "title": title,
      "slug": slug.current,
      regionCode,
      "mapPosition": mapPosition{ x, y }
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
    venuesCta: sanityCtaSchema.nullable(),
  }),
  venues: z.array(
    z.strictObject({
      title: z.string(),
      slug: z.string(),
      regionCode: z.string(),
      mapPosition: z.strictObject({ x: z.number(), y: z.number() }),
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
