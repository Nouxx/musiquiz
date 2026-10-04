import { SSR_BUILD } from "astro:env/server";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async function (_context, next) {
  const response = await next();

  if (!SSR_BUILD) return response;

  // SSR streams HTML, so the 200 is sent before a child component throws
  // and 500.astro never renders
  // https://docs.astro.build/en/guides/on-demand-rendering/#html-streaming
  // reading the body rethrows the render error here, where Astro still
  // catches it; losing streaming is fine on the preview build
  const body = await response.arrayBuffer();

  const finalResponse = new Response(body, response);
  
  // robots.txt must keep allowing crawl, or crawlers never see this header
  finalResponse.headers.set("X-Robots-Tag", "noindex, nofollow");

  return finalResponse;
});
