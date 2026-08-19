import type { SanityCta } from "@repo/api/sanity/shared/cta";

import type { Cta } from "../pageComponent.types";

export function toCta(cta: SanityCta | null): Cta | undefined {
  return cta ?? undefined;
}
