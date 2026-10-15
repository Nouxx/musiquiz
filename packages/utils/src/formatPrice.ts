import type { Currency } from "./currency";
import type { Lang } from "./lang";

const LOCALES: Record<Lang, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

const SYMBOLS: Partial<Record<Currency, string>> = {
  EUR: "€",
};

type PriceInput = {
  amount: number;
  lang: Lang;
  currency: Currency;
};

/**
 * A symbol is glued to the amount, a code is a word of its own the UI can draw
 * smaller. [ADR 0024](../../../docs/adr/0024-currency-follows-the-venue-country.md)
 * @example { amount: "16€", unit: undefined }, { amount: "21,50", unit: "CHF" }
 */
export function formatPriceParts({ amount, lang, currency }: PriceInput) {
  const digits = Number.isSafeInteger(amount) ? 0 : 2;

  const number = new Intl.NumberFormat(LOCALES[lang], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);

  const symbol = SYMBOLS[currency];

  return symbol
    ? { amount: `${number}${symbol}`, unit: undefined }
    : { amount: number, unit: currency };
}

export function formatPrice(input: PriceInput) {
  const { amount, unit } = formatPriceParts(input);

  // no-break, so the code never wraps away from its amount
  return unit ? `${amount}\u{00A0}${unit}` : amount;
}
