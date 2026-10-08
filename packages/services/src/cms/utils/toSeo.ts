import type { SanitySeo } from "@repo/api/sanity/shared/seo";

import type { Seo } from "../types";
import { toCmsImage } from "./toCmsImage";

export function toSeo({
  data,
  fallback,
}: {
  data: SanitySeo;
  fallback: { title: string; description?: string | null };
}): Seo {
  return {
    title: data.title ?? fallback.title,
    description: data.description ?? fallback.description ?? undefined,
    ogImage: toCmsImage(data.ogImage),
    noindex: data.noindex,
  };
}
