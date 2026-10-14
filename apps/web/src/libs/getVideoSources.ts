import type { CmsVideo } from "@repo/services/cms/types";
import { SSR_BUILD } from "astro:env/server";

// written by scripts/encodeVideos.js before the static build
const encodes = import.meta.glob<string>("../generated/video/*.mp4", {
  query: "?url",
  import: "default",
  eager: true,
});

// the profile scripts/encodeVideos.js encodes (Main, level 4.0, 8-bit).
// without the codecs, Safari on hardware with no AV1 decoder picks it and fails
const AV1_TYPE = 'video/mp4; codecs="av01.0.08M.08"';

export function getVideoSources(
  video: CmsVideo,
  profile: "cover" | "carousel",
) {
  // only the static build runs the encoder
  if (import.meta.env.DEV || SSR_BUILD) {
    return [{ src: video.url, type: "video/mp4" }];
  }

  const prefix = `../generated/video/${video.assetId}_${profile}`;
  const main = encodes[`${prefix}_main.mp4`];
  const fallback = encodes[`${prefix}_fallback.mp4`];

  if (!main || !fallback) {
    throw new Error(
      `video ${video.assetId} has no ${profile} encode: run scripts/encodeVideos.js before astro build`,
    );
  }

  return [
    { src: main, type: AV1_TYPE },
    { src: fallback, type: "video/mp4" },
  ];
}
