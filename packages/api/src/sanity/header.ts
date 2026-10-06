import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";

function headerQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "siteSettings": *[_type == "siteSettings"][0]{
      headerLogo ${imageProjection({ lang })},
      mobileMenuLogo ${imageProjection({ lang })},
      mainPhone,
      mainEmail,
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      tiktokUrl,
      youtubeUrl,
    },
    "games": *[_type == "gameFormat" && signature == true]
      | order(displayOrder asc, name asc){
      name,
      "slug": slug.current
    },
    "events": *[_type == "eventFormat"]
      | order(displayOrder asc, name asc){
      name,
      "slug": slug.current
    }
  }`);
}

const formatLinkSchema = z.strictObject({
  name: z.string().min(1),
  slug: z.string().min(1),
});

const sanityHeaderSchema = z.strictObject({
  siteSettings: z.strictObject({
    headerLogo: sanityImageSchema,
    mobileMenuLogo: sanityImageSchema,
    mainPhone: z.string().min(1),
    mainEmail: z.email(),
    facebookUrl: z.url(),
    instagramUrl: z.url(),
    linkedinUrl: z.url(),
    tiktokUrl: z.url(),
    youtubeUrl: z.url(),
  }),
  games: z.array(formatLinkSchema).min(1),
  events: z.array(formatLinkSchema).min(1),
});

export type SanityHeader = z.infer<typeof sanityHeaderSchema>;

export async function fetchHeader({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  return fetchSanityData({
    queryName: "header",
    query: headerQuery({ lang }),
    schema: sanityHeaderSchema,
    config,
  });
}
