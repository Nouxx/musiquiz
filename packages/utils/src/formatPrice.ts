import type { Currency } from "./currency";
import type { Lang } from "./lang";

const LOCALES: Record<Lang, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

// "16€" but "16 CHF": a code takes a space, no-break so it stays on the amount's line
const SUFFIXES: Record<Currency, string> = {
  EUR: "€",
  CHF: "\u{00A0}CHF",
};

export function formatPrice({
  amount,
  lang,
  currency,
}: {
  amount: number;
  lang: Lang;
  currency: Currency;
}) {
  const digits = Number.isSafeInteger(amount) ? 0 : 2;

  const number = new Intl.NumberFormat(LOCALES[lang], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);

  return `${number}${SUFFIXES[currency]}`;
}
