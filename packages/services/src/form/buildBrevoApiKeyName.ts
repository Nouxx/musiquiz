import { splitIntoAsciiWords } from "@repo/utils/splitIntoAsciiWords";

/** @example "saint-etienne" → "BREVO_API_KEY_SAINT_ETIENNE" */
export function buildBrevoApiKeyName(venueSlug: string) {
  const words = splitIntoAsciiWords(venueSlug);

  if (words.length === 0) {
    throw new Error(
      `Venue slug "${venueSlug}" has no letter or digit to name a Brevo secret after`,
    );
  }

  return `BREVO_API_KEY_${words.join("_").toUpperCase()}`;
}
