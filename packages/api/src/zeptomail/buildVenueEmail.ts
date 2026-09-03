const venueSlugs = ["lille", "paris"] as const;

type VenueSlug = (typeof venueSlugs)[number];

function isVenueSlug(input: string): input is VenueSlug {
  return venueSlugs.includes(input as VenueSlug);
}

export function buildVenueEmail(venueSlug: string) {
  if (!isVenueSlug(venueSlug)) {
    throw new Error(`Unsupported venue slug '${venueSlug}'`);
  }
  return `${venueSlug}@musiquiz.co`;
}
