import type { Lang } from "@repo/utils/lang";
import { defineQuery } from "groq";

// todo: why not colocate query + schema + type?
export function fetchFooterQuery() {
  return defineQuery(`{
    "siteSettings": *[_type == "siteSettings"][0]{
          footerLogo,
          facebookUrl,
          instagramUrl,
          linkedinUrl,
          tiktokUrl,
          youtubeUrl,
          mainPhone,
          mainEmail,
      },
    "gameFormats": *[_type == "gameFormat"]{
      name,
      "slug": slug.current
    }
    }`);
}

export function fetchHomepageQuery(lang: Lang) {
  return defineQuery(`{
    "homepage": *[_type == "homepage"][0]{
      logo,
      "badge": badge[language == "${lang}"][0].value,
      "heading": heading[language == "${lang}"][0].value,
    },
    "venues": *[_type == "venue"]{
      "title": title,
      "slug": slug.current
    }
}`);
}
