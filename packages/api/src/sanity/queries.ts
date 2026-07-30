import { defineQuery } from "groq";

// todo: why not colocate query + schema + type?
export function fetchGlobalFooterQuery() {
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
