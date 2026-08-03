import type { fr } from "../locales/fr";

/**
 * makes `t()` autocomplete and reject unknown keys, e.g. t("header.offerAGame")
 */
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof fr;
    };
  }
}
