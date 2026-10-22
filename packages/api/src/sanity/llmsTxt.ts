import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

const lang = "fr";

const llmsTxtPageTypes = [
  "globalBookingPage",
  "whereToFindUsPage",
  "joinTheNetworkPage",
  "contactPage",
  "termsAndConditionsPage",
  "legalNoticePage",
] as const;

const seoDescription = `seo.description[language == "${lang}"][0].value`;

// the fallback is the one the page's meta description falls back to
function pageEntryFields({
  name,
  description = seoDescription,
  fallbackDescription,
}: {
  name: string;
  description?: string;
  fallbackDescription: string;
}) {
  return `
    "name": ${name},
    "description": ${description},
    "fallbackDescription": ${fallbackDescription},
    "noindex": coalesce(seo.noindex, false),`;
}

const pageCoverSubHeading = `pageCover.subHeading[language == "${lang}"][0].value`;

function llmsTxtQuery() {
  return defineQuery(`{
    "summary": *[_type == "siteSettings"][0].llmsSummary,
    "venues": *[_type == "venuePage" && pageType == "home"]{
      "slug": venue->slug.current,
      ${pageEntryFields({
        name: "venue->title",
        description: `coalesce(venue->llmsDescription, ${seoDescription})`,
        fallbackDescription: pageCoverSubHeading,
      })}
    },
    "games": *[_type == "globalGame"]{
      "slug": game->slug.current,
      ${pageEntryFields({
        name: "game->name",
        description: `coalesce(game->llmsDescription, ${seoDescription})`,
        fallbackDescription: pageCoverSubHeading,
      })}
    },
    "events": *[_type == "globalEvent"]{
      "slug": event->slug.current,
      ${pageEntryFields({
        name: "event->name",
        description: `coalesce(event->llmsDescription, ${seoDescription})`,
        fallbackDescription: pageCoverSubHeading,
      })}
    },
    "articles": *[_type == "blogArticle"]{
      "slug": slug.current,
      "name": title,
      "description": seo.description,
      "fallbackDescription": excerpt,
      "noindex": coalesce(seo.noindex, false),
    },
    "pages": *[_type in ${JSON.stringify(llmsTxtPageTypes)}]{
      "type": _type,
      "noindex": coalesce(seo.noindex, false),
    }
  }`);
}

const sanityLlmsTxtEntrySchema = z.strictObject({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  fallbackDescription: z.string().min(1).nullable(),
  noindex: z.boolean(),
});

const sanityLlmsTxtSchema = z.strictObject({
  summary: z.string().min(1).nullable(),
  venues: z.array(sanityLlmsTxtEntrySchema),
  games: z.array(sanityLlmsTxtEntrySchema),
  events: z.array(sanityLlmsTxtEntrySchema),
  articles: z.array(sanityLlmsTxtEntrySchema),
  pages: z.array(
    z.strictObject({
      type: z.enum(llmsTxtPageTypes),
      noindex: z.boolean(),
    }),
  ),
});

export type SanityLlmsTxt = z.infer<typeof sanityLlmsTxtSchema>;

export async function fetchLlmsTxt({ config }: { config: SanityConfig }) {
  return fetchSanityData({
    queryName: "llmsTxt",
    query: llmsTxtQuery(),
    schema: sanityLlmsTxtSchema,
    config,
    lang,
  });
}
