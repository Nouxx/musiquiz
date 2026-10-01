import type { APIContext } from "astro";
import { SSR_BUILD } from "astro:env/server";

import { getSite } from "../libs/getSite";

export function GET(context: APIContext) {
  const lines = ["User-agent: *", "Allow: /"];

  // the preview build has no sitemap
  if (!SSR_BUILD) {
    const sitemap = new URL("sitemap-index.xml", getSite(context));
    lines.push("", `Sitemap: ${sitemap.href}`);
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
