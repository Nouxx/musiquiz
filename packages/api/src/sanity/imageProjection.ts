import type { Lang } from "@repo/utils/lang";

export function imageProjection({ lang }: { lang: Lang }) {
  return `{
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "mimeType": asset->mimeType,
    "alt": alt[language == "${lang}"][0].value
  }`;
}
