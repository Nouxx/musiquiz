import { getSitemapData } from "@repo/services/cms/getSitemapData";
import type { APIContext } from "astro";
import { SSR_BUILD } from "astro:env/server";

import { getSanityConfigFromEnvironment } from "../libs/getSanityConfigFromEnvironment";
import { getSite } from "../libs/getSite";
import { toSitemap } from "../libs/toSitemap";

// not @astrojs/sitemap: it only sees built paths, so a per-page lastmod
// would need a Sanity fetch in its post-build hook, outside astro:env
export async function GET(context: APIContext) {
  if (SSR_BUILD) return new Response(undefined, { status: 404 });

  const entries = await getSitemapData({
    config: getSanityConfigFromEnvironment(),
  });

  return new Response(toSitemap(getSite(context), entries), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
