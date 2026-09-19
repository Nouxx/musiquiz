import type { Lang } from "@repo/utils/lang";

const frenchRoutes = {
  home: "/",
  venueHome: (venue: string) => `/${venue}/`,
  venueBook: (venue: string) => `/${venue}/reserver`,
  venueGame: (venue: string, game: string) => `/${venue}/jeux/${game}`,
  venueEvent: (venue: string, event: string) => `/${venue}/evenements/${event}`,
  venueGifting: (venue: string) => `/${venue}/offrir`,
  faq: "faq",
  contact: "/contact",
  blog: "blog",
  press: "presse",
  joinTheNetwork: "/rejoindre-le-reseau",
  whereToFindUs: "/ou-nous-trouver",
  termsAndConditions: "cgv",
  gdpr: "rgpd",
  legalsNotice: "mentions-legales",
};

const englishRoutes: typeof frenchRoutes = {
  home: "/en/",
  venueHome: (venue: string) => `/en/${venue}/`,
  venueBook: (venue: string) => `/en/${venue}/book`,
  venueGame: (venue: string, game: string) => `/en/${venue}/games/${game}`,
  venueEvent: (venue: string, event: string) => `/en/${venue}/events/${event}`,
  venueGifting: (venue: string) => `/en/${venue}/gift`,
  faq: "faq",
  contact: "/en/contact",
  blog: "blog",
  press: "press",
  joinTheNetwork: "/en/join-the-network",
  whereToFindUs: "/en/where-to-find-us",
  termsAndConditions: "terms",
  gdpr: "gdpr",
  legalsNotice: "legals-notice",
};

export function getRoutesForLang(lang: Lang) {
  return lang === "fr" ? frenchRoutes : englishRoutes;
}
