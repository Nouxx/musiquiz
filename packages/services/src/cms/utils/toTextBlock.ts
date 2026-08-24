import type { SanityTextBlock } from "@repo/api/sanity/shared/textBlock";

import type { TextBlock } from "../pageComponent.types";
import { toCta } from "./toCta";
import { toRichText } from "./toRichText";

export function toTextBlock(data: SanityTextBlock): TextBlock {
  return {
    badge: data.badge ?? undefined,
    title: data.title,
    body: toRichText(data.body),
    additionalCtas: data.additionalCtas ?? [],
    cta: toCta(data.cta),
    ctaTone: data.ctaTone,
  };
}
