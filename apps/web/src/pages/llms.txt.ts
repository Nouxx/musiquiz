import { getLlmsTxtData } from "@repo/services/cms/getLlmsTxtData";
import type { APIContext } from "astro";
import { SSR_BUILD } from "astro:env/server";

import { getSanityConfigFromEnvironment } from "../libs/getSanityConfigFromEnvironment";
import { getSite } from "../libs/getSite";
import { toLlmsTxt } from "../libs/toLlmsTxt";

export async function GET(context: APIContext) {
  // the preview build is noindex, it has no map of itself to hand out
  if (SSR_BUILD) return new Response(undefined, { status: 404 });

  const data = await getLlmsTxtData({
    config: getSanityConfigFromEnvironment(),
  });

  return new Response(toLlmsTxt(getSite(context), data), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
