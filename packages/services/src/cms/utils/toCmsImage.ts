import type { SanityImage } from "@repo/api/sanity/types";

import type { CmsImage } from "../types";

/**
 * longest width that can be fetch from Sanity
 * that accepts images up to 8000px
 * https://www.sanity.io/docs/content-lake/technical-limits#k2c53dc30e24b
 */
const MAX_SOURCE_WIDTH = 2560;

const SVG_MIME_TYPE = "image/svg+xml";

export function toCmsImage(image: SanityImage): CmsImage {
  const alt = image.alt ?? "";

  if (image.mimeType === SVG_MIME_TYPE) {
    return { ...image, alt };
  }

  const width = Math.min(image.width, MAX_SOURCE_WIDTH);
  const height = Math.round((image.height * width) / image.width);

  return {
    // fit=max => belt and braces
    // this guarantees Sanity never scales a smaller upload up to meet it
    url: `${image.url}?w=${width}&fit=max`,
    width,
    height,
    mimeType: image.mimeType,
    alt,
  };
}
