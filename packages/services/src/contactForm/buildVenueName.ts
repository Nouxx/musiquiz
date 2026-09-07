function capitalizeFirstLetter(input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function buildVenueName(venueSlug: string) {
  return `Musi'Quiz ${capitalizeFirstLetter(venueSlug)}`;
}
