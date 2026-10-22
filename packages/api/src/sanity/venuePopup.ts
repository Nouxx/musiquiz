import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { sanityCtaSchema } from "./shared/cta";
import { optionalImageProjection, sanityImageSchema } from "./shared/image";

function venuePopupQuery({
  lang,
  venueSlug,
}: {
  lang: Lang;
  venueSlug: string;
}) {
  return defineQuery(`{
    "popup": *[
      _type == "venuePopup"
      && enabled == true
      && venue->slug.current == "${venueSlug}"
    ][0]{
      _id,
      _rev,
      background,
      "title": title[language == "${lang}"][0].value,
      "text": text[language == "${lang}"][0].value,
      "cta": cta{
        "label": label[language == "${lang}"][0].value,
        "url": url[language == "${lang}"][0].value
      },
      "logo": ${optionalImageProjection({ field: "logo", lang })}
    }
  }`);
}

const sanityVenuePopupSchema = z.strictObject({
  popup: z
    .strictObject({
      _id: z.string().min(1),
      _rev: z.string().min(1),
      background: z.enum(["glass", "vivid"]),
      title: z.string().min(1),
      text: z.string().min(1),
      cta: sanityCtaSchema,
      logo: sanityImageSchema.nullable(),
    })
    .nullable(),
});

export type SanityVenuePopup = z.infer<typeof sanityVenuePopupSchema>;

export async function fetchVenuePopup({
  config,
  lang,
  venueSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
}) {
  return fetchSanityData({
    queryName: "venuePopup",
    query: venuePopupQuery({ lang, venueSlug }),
    schema: sanityVenuePopupSchema,
    config,
    lang,
  });
}
