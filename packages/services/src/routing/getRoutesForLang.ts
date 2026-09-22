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
  blog: "/blog/",
  blogPage: (page: number) => (page === 1 ? "/blog/" : `/blog/page/${page}`),
  blogArticle: (slug: string) => `/blog/${slug}`,
  press: "presse",
  joinTheNetwork: "/rejoindre-le-reseau",
  whereToFindUs: "/ou-nous-trouver",
  termsAndConditions: "/cgv",
  gdpr: "rgpd",
  legalNotice: "/mentions-legales",
};

// the blog is French only, see docs/adr/0013
type BlogRoutes = "blog" | "blogPage" | "blogArticle";

const englishRoutes: Omit<typeof frenchRoutes, BlogRoutes> = {
  home: "/en/",
  venueHome: (venue: string) => `/en/${venue}/`,
  venueBook: (venue: string) => `/en/${venue}/book`,
  venueGame: (venue: string, game: string) => `/en/${venue}/games/${game}`,
  venueEvent: (venue: string, event: string) => `/en/${venue}/events/${event}`,
  venueGifting: (venue: string) => `/en/${venue}/gift`,
  faq: "faq",
  contact: "/en/contact",
  press: "press",
  joinTheNetwork: "/en/join-the-network",
  whereToFindUs: "/en/where-to-find-us",
  termsAndConditions: "/en/terms",
  gdpr: "gdpr",
  legalNotice: "/en/legal-notice",
};

export function getRoutesForLang(lang: "fr"): typeof frenchRoutes;
export function getRoutesForLang(lang: "en"): typeof englishRoutes;
export function getRoutesForLang(
  lang: Lang,
): typeof frenchRoutes | typeof englishRoutes;
export function getRoutesForLang(lang: Lang) {
  return lang === "fr" ? frenchRoutes : englishRoutes;
}
