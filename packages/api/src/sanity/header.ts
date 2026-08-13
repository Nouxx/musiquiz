import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";

function headerQuery({ lang, venueSlug }: { lang: Lang; venueSlug: string }) {
  return defineQuery(`{
    "siteSettings": *[_type == "siteSettings"][0]{
      headerLogo ${imageProjection({ lang })}
    },
    "venue": *[_type == "venue" && slug.current == "${venueSlug}"][0]{
      "games": offerings[].game->{
        name,
        "slug": slug.current
      },
      venueLogo ${imageProjection({ lang })}
    }
  }`);
}

const sanityHeaderSchema = z.strictObject({
  siteSettings: z.strictObject({
    headerLogo: sanityImageSchema,
  }),
  venue: z.strictObject({
    games: z.array(
      z.strictObject({
        name: z.string(),
        slug: z.string(),
      }),
    ),
    venueLogo: sanityImageSchema,
  }),
});

export type SanityHeader = z.infer<typeof sanityHeaderSchema>;

export async function fetchHeader({
  config,
  lang,
  venueSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
}) {
  return fetchSanityData({
    query: headerQuery({ lang, venueSlug }),
    schema: sanityHeaderSchema,
    config,
  });
}
