import type { Lang } from "@repo/utils/lang";
import { defineQuery } from "groq";

function imageProjection({ lang }: { lang: Lang }) {
  return `{
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "mimeType": asset->mimeType,
    "alt": alt[language == "${lang}"][0].value
  }`;
}

// todo: why not colocate query + schema + type?
export function fetchFooterQuery({ lang }: { lang: Lang }) {
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
    },
    "venues": *[_type == "venue"]{
      title,
      "slug": slug.current
    }
    }
  `);
}

export function fetchVenueFooterQuery({
  lang,
  venueSlug,
}: {
  lang: Lang;
  venueSlug: string;
}) {
  return defineQuery(`
    {
      "siteSettings": *[_type == "siteSettings"][0]{
        footerLogo ${imageProjection({ lang })},
        facebookUrl,
        instagramUrl,
        linkedinUrl,
        tiktokUrl,
        youtubeUrl,
        "acceptedPaymentMethods": acceptedPaymentMethods[] ${imageProjection({ lang })}
      },
      "venue": *[_type == "venue" && slug.current == "${venueSlug}"][0]{
        title,
        mondayOpeningHours,
        tuesdayOpeningHours,
        wednesdayOpeningHours,
        thursdayOpeningHours,
        fridayOpeningHours,
        saturdayOpeningHours,
        sundayOpeningHours,
        mail,
        phone,
        googleMapsLink,
        "offerings": offerings[]{
          "game": game->{ 
            name,
            "slug": slug.current
          }
        }
      },
      "otherVenues": *[_type == "venue" && slug.current != "${venueSlug}"]{
        title,
        "slug": slug.current
      }
    }
  `);
}

export function fetchHomepageQuery(lang: Lang) {
  return defineQuery(`
  {
    "homepage": *[_type == "homepage"][0]{
      "badge": badge[language == "${lang}"][0].value,
      "heading": heading[language == "${lang}"][0].value,
      logo ${imageProjection({ lang })}
    },
    "venues": *[_type == "venue"]{
      "title": title,
      "slug": slug.current
    }
  }
  `);
}

export function fetchVenuesSlugQuery() {
  return defineQuery(`
    *[_type == "venue"]{
      "slug": slug.current
    }
  `);
}

export function fetchHeaderQuery({
  lang,
  venueSlug,
}: {
  lang: Lang;
  venueSlug: string;
}) {
  return defineQuery(`
    {
      "siteSettings": *[_type == "siteSettings"][0]{
          headerLogo ${imageProjection({ lang })}
      },
      "gameFormats": *[_type == "venue" && slug.current == "${venueSlug}"][0].offerings[]{
          "game": game->{ 
            name,
            "slug": slug.current
          }
      }
    }
  `);
}

export function fetchVenueHomepageQuery({
  venueSlug,
  lang,
}: {
  venueSlug: string;
  lang: Lang;
}) {
  return defineQuery(`
    {
      "pageCover": *[_type == "venue" && slug.current == "${venueSlug}"][0]{
        pageCoverMedia ${imageProjection({ lang })},
        "pageCoverHeading": pageCoverHeading[language == "${lang}"][0].value,
        "pageCoverSubHeading": pageCoverSubHeading[language == "${lang}"][0].value,
        "pageCoverBadge": pageCoverBadge[language == "${lang}"][0].value,
        "pageCoverCtaLabel": pageCoverCtaLabel[language == "${lang}"][0].value,
      }
    }
  `);
}
