import type { Lang } from "@repo/utils/lang";

function venueHome(venue: string, lang: Lang) {
  return lang === "fr" ? `/${venue}/` : `/en/${venue}/`;
}

function venueBook(venue: string, lang: Lang) {
  return lang === "fr" ? `/${venue}/reserver` : `/en/${venue}/book`;
}

function venueGame(venue: string, game: string) {
  return `/${venue}/${game}`;
}

function venueGifting(venue: string, lang: Lang) {
  return lang === "fr" ? `/${venue}/offrir` : `/${venue}/gift`;
}

const frenchRoutes = {
  home: "/",
  venueHome: venueHome,
  venueBook: venueBook,
  venueGame: venueGame,
  venueGifting: venueGifting,
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
  venueHome: venueHome,
  venueBook: venueBook,
  venueGame: venueGame,
  venueGifting: venueGifting,
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
