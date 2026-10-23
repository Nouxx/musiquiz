import { splitIntoAsciiWords } from "./splitIntoAsciiWords";

export const VENUE_SLUG_MAX_LENGTH = 40;

// a leading letter because buildVenueEmail and the Brevo secret name are built from it
export const venueSlugPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export function isVenueSlug(value: string) {
  return value.length <= VENUE_SLUG_MAX_LENGTH && venueSlugPattern.test(value);
}

/** @example "Saint-Étienne" → "saint-etienne" */
export function slugifyVenueTitle(title: string) {
  return splitIntoAsciiWords(title)
    .join("-")
    .slice(0, VENUE_SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
}
