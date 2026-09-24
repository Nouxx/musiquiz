import { getRoutesForLang } from "@repo/services/routing/getRoutesForLang";

export const BLOG_PAGE_SIZE = 12;

export function blogPageCount(articleCount: number) {
  return Math.max(1, Math.ceil(articleCount / BLOG_PAGE_SIZE));
}

export function blogPageLinks(articleCount: number) {
  const routes = getRoutesForLang("fr");

  return Array.from({ length: blogPageCount(articleCount) }, (_, index) => ({
    page: index + 1,
    url: routes.blogPage(index + 1),
  }));
}
