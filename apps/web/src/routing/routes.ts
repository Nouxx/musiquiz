import type { Lang } from "@repo/utils/lang";

type Routes = {
  home: string;
  book: string;
  gifting: string;
  faq: string;
  contact: string;
  blog?: string; // blog is not translated
  press: string;
  franchise: string;
  termsAndConditions: string;
  gdpr: string;
  legalsNotice: string;
};

const frenchRoutes: Routes = {
  home: "/",
  book: "reserver",
  gifting: "offrir",
  faq: "faq",
  contact: "contact",
  blog: "blog",
  press: "presse",
  franchise: "franchise",
  termsAndConditions: "cgv",
  gdpr: "rgpd",
  legalsNotice: "mentions-legales",
};

const englishRoutes: Routes = {
  home: "/",
  book: "book",
  gifting: "gift",
  faq: "faq",
  contact: "contact",
  press: "press",
  franchise: "franchise",
  termsAndConditions: "terms",
  gdpr: "gdpr",
  legalsNotice: "legals-notice",
};

export function getRoutesForLang(lang: Lang) {
  return lang === "fr" ? frenchRoutes : englishRoutes;
}
