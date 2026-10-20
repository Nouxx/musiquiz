import type { SitemapEntry } from "@repo/services/cms/types";

const xmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(text: string) {
  return text.replaceAll(/[&<>"']/g, (char) => xmlEntities[char]!);
}

function toLink(hreflang: string, href: string) {
  return `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`;
}

// the same alternates as SeoHead's hreflang links
function toUrl(
  loc: string,
  lastmod: string,
  alternates?: { fr: string; en: string },
) {
  return [
    "<url>",
    `<loc>${escapeXml(loc)}</loc>`,
    `<lastmod>${lastmod}</lastmod>`,
    ...(alternates
      ? [
          toLink("fr", alternates.fr),
          toLink("en", alternates.en),
          toLink("x-default", alternates.fr),
        ]
      : []),
    "</url>",
  ].join("");
}

export function toSitemap(site: URL, entries: SitemapEntry[]): string {
  const urls = entries.flatMap(({ fr: frPath, en: enPath, lastmod }) => {
    const fr = new URL(frPath, site).href;

    if (!enPath) return [toUrl(fr, lastmod)];

    const alternates = { fr, en: new URL(enPath, site).href };

    return [
      toUrl(fr, lastmod, alternates),
      toUrl(alternates.en, lastmod, alternates),
    ];
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
