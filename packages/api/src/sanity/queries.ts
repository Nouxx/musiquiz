import type { Lang } from "@repo/utils/lang";
import { defineQuery } from "groq";

import { imageProjection } from "./shared/image";

// todo: why not colocate query + schema + type?

export function fetchVenuesSlugQuery() {
  return defineQuery(`
    *[_type == "venue"]{
      "slug": slug.current
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
