import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";

const lang = "fr";

function organizationQuery() {
  return defineQuery(`*[_type == "siteSettings"][0]{
    footerLogo ${imageProjection({ lang })},
    facebookUrl,
    instagramUrl,
    linkedinUrl,
    tiktokUrl,
    youtubeUrl,
    mainPhone,
    mainEmail,
  }`);
}

const sanityOrganizationSchema = z.strictObject({
  footerLogo: sanityImageSchema,
  facebookUrl: z.url(),
  instagramUrl: z.url(),
  linkedinUrl: z.url(),
  tiktokUrl: z.url(),
  youtubeUrl: z.url(),
  mainPhone: z.string().min(1),
  mainEmail: z.email(),
});

export type SanityOrganization = z.infer<typeof sanityOrganizationSchema>;

export async function fetchOrganization({ config }: { config: SanityConfig }) {
  return fetchSanityData({
    queryName: "organization",
    query: organizationQuery(),
    schema: sanityOrganizationSchema,
    config,
  });
}
