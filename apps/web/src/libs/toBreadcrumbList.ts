import type { BreadcrumbItem } from "@repo/ui/types";

export function getBreadcrumbId(pageUrl: string) {
  return `${pageUrl}#breadcrumb`;
}

export function toBreadcrumbList({
  site,
  pageUrl,
  items,
}: {
  site: URL;
  pageUrl: string;
  items: BreadcrumbItem[];
}) {
  return {
    "@type": "BreadcrumbList",
    "@id": getBreadcrumbId(pageUrl),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.url && { item: new URL(item.url, site).href }),
    })),
  };
}
