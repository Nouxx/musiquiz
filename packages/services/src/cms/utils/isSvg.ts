import type { CmsImage } from "../types";

export function isSvg(image: CmsImage) {
  return image.mimeType === "image/svg+xml";
}
