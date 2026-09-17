import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { imageProjection, sanityImageSchema } from "./shared/image";
import { pageCoverProjection, sanityPageCoverSchema } from "./shared/pageCover";

function contactPageQuery({ lang }: { lang: Lang }) {
  return defineQuery(`{
    "page": *[_type == "globalPage" && pageType == "contact"][0]{
      pageCover ${pageCoverProjection({ lang })},
      "teamTitle": teamTitle[language == "${lang}"][0].value,
      "teamIntro": teamIntro[language == "${lang}"][0].value,
      "venuesTitle": venuesTitle[language == "${lang}"][0].value,
      "venuesIntro": venuesIntro[language == "${lang}"][0].value,
    },
    "teamMembers": *[_type == "siteSettings"][0].teamMembers[]{
      photo ${imageProjection({ lang })},
      name,
      "role": role[language == "${lang}"][0].value,
      "jobTitle": jobTitle[language == "${lang}"][0].value,
      tone,
      email,
    },
    "venues": *[_type == "venue"] | order(title asc){
      title,
      venueLogoDark ${imageProjection({ lang })},
      addressLine,
      phone,
      mail,
    },
  }`);
}

const sanityContactPageSchema = z.strictObject({
  page: z.strictObject({
    pageCover: sanityPageCoverSchema,
    teamTitle: z.string().min(1),
    teamIntro: z.string().min(1).nullable(),
    venuesTitle: z.string().min(1),
    venuesIntro: z.string().min(1).nullable(),
  }),
  teamMembers: z
    .array(
      z.strictObject({
        photo: sanityImageSchema,
        name: z.string().min(1),
        role: z.string().min(1),
        jobTitle: z.string().min(1),
        tone: z.enum(["blue", "red"]),
        email: z.email(),
      }),
    )
    .min(1),
  venues: z
    .array(
      z.strictObject({
        title: z.string().min(1),
        venueLogoDark: sanityImageSchema,
        addressLine: z.string().min(1),
        phone: z.string().min(1),
        mail: z.email(),
      }),
    )
    .min(1),
});

export type SanityContactPage = z.infer<typeof sanityContactPageSchema>;

export async function fetchContactPage({
  config,
  lang,
}: {
  config: SanityConfig;
  lang: Lang;
}) {
  return fetchSanityData({
    query: contactPageQuery({ lang }),
    schema: sanityContactPageSchema,
    config,
  });
}
