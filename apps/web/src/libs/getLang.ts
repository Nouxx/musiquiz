import type { Lang } from "@repo/utils/lang";

import { isLang } from "./i18n";

/**
 * `Astro` is not a global: the compiler turns each .astro file into a function
 * that receives it as a parameter, so it is `undefined` in a .ts: drilling it down is the documented fix
 * https://github.com/withastro/roadmap/discussions/190
 * https://docs.astro.build/en/reference/api-reference/#astro-global
 */
export function getLang(astro: { currentLocale: string | undefined }): Lang {
  if (!astro.currentLocale) {
    throw new Error(
      "Astro was not able to compute the locale, no fallback are set up",
    );
  }

  if (!isLang(astro.currentLocale)) {
    throw new Error("Locale ${astro.currentLocale} could not be processed");
  }

  return astro.currentLocale;
}
