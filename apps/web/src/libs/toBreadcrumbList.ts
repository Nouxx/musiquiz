import type { BreadcrumbItem } from "@repo/ui/types";

export function toBreadcrumbList(site: URL, items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.url && { item: new URL(item.url, site).href }),
    })),
  };
}
