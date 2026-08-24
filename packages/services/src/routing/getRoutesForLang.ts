import type { Lang } from "@repo/utils/lang";

const frenchRoutes = {
  home: "/",
  venueHome: (venue: string) => `/${venue}/`,
  venueBook: (venue: string) => `/${venue}/reserver`,
  venueGame: (venue: string, game: string) => `/${venue}/jeux/${game}`,
  venueGifting: (venue: string) => `/${venue}/offrir`,
  faq: "faq",
  contact: "contact",
  blog: "blog",
  press: "presse",
  franchise: "franchise",
  termsAndConditions: "cgv",
  gdpr: "rgpd",
  legalsNotice: "mentions-legales",
};

const englishRoutes: typeof frenchRoutes = {
  home: "/en/",
  venueHome: (venue: string) => `/en/${venue}/`,
  venueBook: (venue: string) => `/en/${venue}/book`,
  venueGame: (venue: string, game: string) => `/en/${venue}/games/${game}`,
  venueGifting: (venue: string) => `/en/${venue}/gift`,
  faq: "faq",
  contact: "contact",
  blog: "blog",
  press: "press",
  franchise: "franchise",
  termsAndConditions: "terms",
  gdpr: "gdpr",
  legalsNotice: "legals-notice",
};

export function getRoutesForLang(lang: Lang) {
  return lang === "fr" ? frenchRoutes : englishRoutes;
}
