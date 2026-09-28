import { capitalizeFirstLetter } from "@repo/utils/capitalizeFirstLetter";

export function buildVenueName(venueSlug: string) {
  return `Musi'Quiz ${capitalizeFirstLetter(venueSlug)}`;
}
