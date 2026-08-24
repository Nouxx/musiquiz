import type { Lang } from "./lang";

const LOCALES: Record<Lang, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

export function formatEuros(amount: number, lang: Lang) {
  const digits = Number.isSafeInteger(amount) ? 0 : 2;

  const number = new Intl.NumberFormat(LOCALES[lang], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);

  return `${number}€`;
}
