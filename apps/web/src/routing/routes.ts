import type { Lang } from "@repo/utils/lang";

type Routes = {
  home: string;
  book: string;
  gifting: string;
};

export const frenchRoute = {
  home: "/",
  book: "reserver",
  gifting: "offrir",
} satisfies Routes;

export const englishRoute = {
  home: "/",
  book: "book",
  gifting: "gift",
} satisfies Routes;

export function getRoutesForLang(lang: Lang) {
  return lang === "fr" ? frenchRoute : englishRoute;
}
