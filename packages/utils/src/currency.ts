export type Currency = "EUR" | "CHF";

/** @param country ISO 3166-1 alpha-2, as on the venue */
export function currencyOf(country: string): Currency {
  return country === "CH" ? "CHF" : "EUR";
}
