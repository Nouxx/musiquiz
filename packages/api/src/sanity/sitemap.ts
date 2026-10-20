import type { SanityConfig } from "@repo/utils/sanityConfig";
import { defineQuery } from "groq";
import { z } from "zod";

import { fetchSanityData } from "./fetchData";

const sitemapPageTypes = [
  "homepage",
  "globalBookingPage",
  "whereToFindUsPage",
  "joinTheNetworkPage",
  "contactPage",
  "termsAndConditionsPage",
  "legalNoticePage",
  "blogPage",
] as const;

const entryFields = `
  "updatedAt": _updatedAt,
  "noindex": coalesce(seo.noindex, false),`;

function sitemapQuery() {
  return defineQuery(`{
    "pages": *[_type in ${JSON.stringify(sitemapPageTypes)}]{
      "type": _type,
      ${entryFields}
    },
    "venuePages": *[_type == "venuePage"]{
      "venueSlug": venue->slug.current,
      "venueUpdatedAt": venue->_updatedAt,
      pageType,
      ${entryFields}
    },
    "venueGames": *[_type == "venueGame"]{
      "venueSlug": venue->slug.current,
      "slug": game->slug.current,
      ${entryFields}
    },
    "venueEvents": *[_type == "venueEvent"]{
      "venueSlug": venue->slug.current,
      "slug": event->slug.current,
      ${entryFields}
    },
    "venueCustomPages": *[_type == "venueCustomPage"]{
      "venueSlug": venue->slug.current,
      "slug": slug.current,
      ${entryFields}
    },
    "games": *[_type == "globalGame"]{
      "slug": game->slug.current,
      ${entryFields}
    },
    "events": *[_type == "globalEvent"]{
      "slug": event->slug.current,
      ${entryFields}
    },
    "articles": *[_type == "blogArticle"]{
      "slug": slug.current,
      ${entryFields}
    }
  }`);
}

const entrySchema = z.strictObject({
  updatedAt: z.string().min(1),
  noindex: z.boolean(),
});

const sluggedEntrySchema = entrySchema.extend({ slug: z.string().min(1) });

const venueEntrySchema = sluggedEntrySchema.extend({
  venueSlug: z.string().min(1),
});

const sanitySitemapSchema = z.strictObject({
  pages: z.array(entrySchema.extend({ type: z.enum(sitemapPageTypes) })),
  venuePages: z.array(
    entrySchema.extend({
      venueSlug: z.string().min(1),
      venueUpdatedAt: z.string().min(1),
      pageType: z.enum(["home", "book", "gift"]),
    }),
  ),
  venueGames: z.array(venueEntrySchema),
  venueEvents: z.array(venueEntrySchema),
  venueCustomPages: z.array(venueEntrySchema),
  games: z.array(sluggedEntrySchema),
  events: z.array(sluggedEntrySchema),
  articles: z.array(sluggedEntrySchema),
});

export type SanitySitemap = z.infer<typeof sanitySitemapSchema>;

export async function fetchSitemap({ config }: { config: SanityConfig }) {
  return fetchSanityData({
    queryName: "sitemap",
    query: sitemapQuery(),
    schema: sanitySitemapSchema,
    config,
  });
}
