import type { CmsVideo } from "@repo/services/cms/types";
import { SSR_BUILD } from "astro:env/server";

// written by scripts/encodeCoverVideos.js before the static build
const encodes = import.meta.glob<string>("../generated/cover-video/*.mp4", {
  query: "?url",
  import: "default",
  eager: true,
});

// the profile scripts/encodeCoverVideos.js encodes (Main, level 4.0, 8-bit).
// without the codecs, Safari on hardware with no AV1 decoder picks it and fails
const AV1_TYPE = 'video/mp4; codecs="av01.0.08M.08"';

export function getCoverVideoSources(video: CmsVideo) {
  // only the static build runs the encoder
  if (import.meta.env.DEV || SSR_BUILD) {
    return [{ src: video.url, type: "video/mp4" }];
  }

  const main = encodes[`../generated/cover-video/${video.assetId}_main.mp4`];
  const fallback =
    encodes[`../generated/cover-video/${video.assetId}_fallback.mp4`];

  if (!main || !fallback) {
    throw new Error(
      `cover video ${video.assetId} was not encoded: run scripts/encodeCoverVideos.js before astro build`,
    );
  }

  return [
    { src: main, type: AV1_TYPE },
    { src: fallback, type: "video/mp4" },
  ];
}
