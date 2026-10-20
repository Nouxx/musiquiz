import type {
  SiteUrlAnchor,
  SiteUrlRoute,
} from "@repo/services/routing/siteUrls";

export const routeLabels: Record<SiteUrlRoute, string> = {
  home: "Home",
  book: "Booking, all venues",
  game: "Game",
  event: "Event",
  whereToFindUs: "Where to find us",
  joinTheNetwork: "Join the network",
  contact: "Contact",
  termsAndConditions: "Terms and conditions",
  legalNotice: "Legal notice",
  venueHome: "Venue home",
  venueBook: "Booking",
  venueGifting: "Gifting",
  venueGame: "Game",
  venueEvent: "Event",
  venueCustomPage: "Custom page",
  blog: "Blog home",
  blogArticle: "Article",
};

export const anchorLabels: Record<SiteUrlAnchor, string> = {
  venuesMap: "venues map",
  booking: "booking widget",
  gifting: "gifting widget",
  prices: "prices",
  venuesContact: "venue contacts",
  venueOpeningForm: "opening form",
  venueTerms: "this venue's terms",
};
