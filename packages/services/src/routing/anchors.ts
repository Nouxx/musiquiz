export const anchors = {
  venuesMap: "venuesMap",
  booking: "booking",
  gifting: "gifting",
  prices: "prices",
  venuesContact: "venues-contact",
  venueOpeningForm: "venue-opening-form",
  article: "article",
} as const;

export type Anchor = (typeof anchors)[keyof typeof anchors];

/** the terms and conditions page anchors each venue's terms on its slug */
export function venueTermsAnchor(venueSlug: string) {
  return venueSlug;
}
