import type { Lang } from "@repo/utils/lang";
import i18next from "i18next";

import { en } from "../locales/en";
import { fr } from "../locales/fr";

const LANGUAGES: Lang[] = ["fr", "en"];

/**
 * a dedicated instance, not the `i18next` default export:
 * the SSR preview build shares one module instance across requests, so mutating
 * a global singleton (`changeLanguage`) would leak a language between renders
 */
function createI18nInstance() {
  const instance = i18next.createInstance();

  instance.init({
    lng: "fr",
    fallbackLng: "fr",
    // cspell:ignore Lngs
    supportedLngs: LANGUAGES,
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    interpolation: {
      // Astro already escapes `{expression}` output, escaping here would double-encode
      escapeValue: false,
    },
  });

  return instance;
}

const i18n = createI18nInstance();

export function getT(lang: Lang) {
  return i18n.getFixedT(lang);
}

export function isLang(value: string | undefined): value is Lang {
  return LANGUAGES.includes(value as Lang);
}
