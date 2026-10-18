import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import { sanityCtaSchema } from "./shared/cta";
import {
  imageProjection,
  optionalImageProjection,
  sanityImageSchema,
} from "./shared/image";

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
      background == "image" => {
        "backgroundImage": backgroundImage ${imageProjection({ lang })}
      },
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

const popupContentSchema = {
  _id: z.string().min(1),
  _rev: z.string().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
  cta: sanityCtaSchema,
  logo: sanityImageSchema.nullable(),
};

const sanityVenuePopupSchema = z.strictObject({
  popup: z
    .discriminatedUnion("background", [
      z.strictObject({ ...popupContentSchema, background: z.literal("glass") }),
      z.strictObject({
        ...popupContentSchema,
        background: z.literal("image"),
        backgroundImage: sanityImageSchema,
      }),
    ])
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
  });
}
