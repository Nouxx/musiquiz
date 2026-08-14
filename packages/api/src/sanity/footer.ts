import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";

function footerQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "siteSettings": *[_type == "siteSettings"][0]{
      footerLogo ${imageProjection({ lang })},
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      tiktokUrl,
      youtubeUrl,
      mainPhone,
      mainEmail,
      "acceptedPaymentMethods": acceptedPaymentMethods[] ${imageProjection({ lang })}
    },
    "gameFormats": *[_type == "gameFormat"]{
      name,
      "slug": slug.current
    }
  }`);
}

const sanityFooterSchema = z.strictObject({
  siteSettings: z.strictObject({
    facebookUrl: z.url(),
    footerLogo: sanityImageSchema,
    instagramUrl: z.url(),
    linkedinUrl: z.url(),
    mainEmail: z.email(),
    mainPhone: z.string().min(1),
    tiktokUrl: z.url(),
    youtubeUrl: z.url(),
    acceptedPaymentMethods: z.array(sanityImageSchema),
  }),
  gameFormats: z.array(
    z.strictObject({
      name: z.string().min(1),
      slug: z.string().min(1),
    }),
  ),
});

export type SanityFooter = z.infer<typeof sanityFooterSchema>;

export async function fetchFooter({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  return fetchSanityData({
    query: footerQuery({ lang }),
    schema: sanityFooterSchema,
    config,
  });
}
