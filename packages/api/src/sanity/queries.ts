import { defineQuery } from "groq";

export function fetchVenuesSlugQuery() {
  return defineQuery(`
    *[_type == "venue"]{
      "slug": slug.current
    }
  `);
}
