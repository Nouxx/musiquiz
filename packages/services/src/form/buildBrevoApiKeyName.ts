/** @example "saint-etienne" → "BREVO_API_KEY_SAINT_ETIENNE" */
export function buildBrevoApiKeyName(venueSlug: string) {
  return `BREVO_API_KEY_${venueSlug.toUpperCase().replaceAll("-", "_")}`;
}
