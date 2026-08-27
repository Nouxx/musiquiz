import type { Lang } from "@repo/utils/lang";
import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";
import {
  pageComponentsProjection,
  sanityPageComponentSchema,
} from "./shared/pageComponents";
import { pageCoverProjection, sanityPageCoverSchema } from "./shared/pageCover";

function venueEventPageQuery({
  lang,
  venueSlug,
  eventSlug,
}: {
  lang: Lang;
  venueSlug: string;
  eventSlug: string;
}) {
  return defineQuery(`{
    "venueEvent": *[_type == "venueEvent"
      && venue->slug.current == "${venueSlug}"
      && event->slug.current == "${eventSlug}"][0]{
      "eventName": event->name,
      pageCover ${pageCoverProjection({ lang })},
      "pageComponents": ${pageComponentsProjection({ lang })},
    }
  }`);
}

const sanityVenueEventPageSchema = z.strictObject({
  venueEvent: z.strictObject({
    eventName: z.string().min(1),
    pageCover: sanityPageCoverSchema,
    pageComponents: z.array(sanityPageComponentSchema).nullable(),
  }),
});

export type SanityVenueEventPage = z.infer<typeof sanityVenueEventPageSchema>;

export async function fetchVenueEventPage({
  config,
  lang,
  venueSlug,
  eventSlug,
}: {
  config: SanityConfig;
  lang: Lang;
  venueSlug: string;
  eventSlug: string;
}) {
  return fetchSanityData({
    query: venueEventPageQuery({ lang, venueSlug, eventSlug }),
    schema: sanityVenueEventPageSchema,
    config,
  });
}
