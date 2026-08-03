import type { Lang } from "@repo/utils/lang";

type Routes = {
  home: string;
  venueHome: (venue: string) => string;
  venueBook: (venue: string, lang: Lang) => string;
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

function venueHome(venue: string) {
  return `/${venue}/`;
}

function venueBook(venue: string, lang: Lang) {
  return lang === "fr" ? `/${venue}/reserver` : `/${venue}/book`;
}

const frenchRoutes: Routes = {
  home: "/",
  venueHome: venueHome,
  venueBook: venueBook,
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
  venueHome: venueHome,
  venueBook: venueBook,
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
