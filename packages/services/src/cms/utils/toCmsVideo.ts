import type { SanityVideo } from "@repo/api/sanity/shared/video";

import type { CmsImage, CmsVideo } from "../types";
import { toCmsImage } from "./toCmsImage";

export function toCmsVideo({ assetId, url, poster }: SanityVideo): {
  video: CmsVideo;
  poster: CmsImage;
} {
  if (!poster) {
    throw new Error(`video ${assetId}: needs a poster`);
  }

  return { video: { assetId, url }, poster: toCmsImage(poster) };
}
