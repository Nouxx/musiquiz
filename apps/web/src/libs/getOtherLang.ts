import type { FlagIconName } from "@repo/ui/lib/icons";
import type { Lang } from "@repo/utils/lang";

type LangWithLabel = {
  lang: Lang;
  label: "Français" | "English";
  icon: FlagIconName;
};

export function getOtherLang(lang: Lang): LangWithLabel {
  return lang === "en"
    ? {
        lang: "fr",
        label: "Français",
        icon: "flag-france",
      }
    : {
        lang: "en",
        label: "English",
        icon: "flag-uk",
      };
}
