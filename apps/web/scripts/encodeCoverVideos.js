import { execFile } from "node:child_process";
import { createWriteStream } from "node:fs";
import { copyFile, mkdir, rename, rm, stat } from "node:fs/promises";
import { env, exit } from "node:process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";

import { ffmpegPath, isFfmpegAvailable } from "node-av/ffmpeg";

/**
 * Encodes every published cover video into an AV1 and an H.264 MP4, for the
 * static build to bundle. See docs/adr/0022-cover-video-is-a-plain-file-asset.md
 */
const run = promisify(execFile);

// Workers Builds keeps Astro's cache directory between builds, nothing else of ours
const CACHE = "./node_modules/.astro/cover-video";
const OUT = "./src/generated/cover-video";

const MAX_BYTES = 10 * 1024 * 1024;

// fits 1920x1080, or 1080x1920 for a portrait clip, never upscaled
const FILTERS =
  "scale=w='min(iw,if(gte(iw,ih),1920,1080))':h='min(ih,if(gte(iw,ih),1080,1920))'" +
  ":force_original_aspect_ratio=decrease:force_divisible_by=2" +
  ",fps=fps='min(source_fps,30)'";

// src/libs/getCoverVideoSources.ts declares this profile in its codecs string
const AV1 = [
  ["-c:v", "libsvtav1"],
  ["-preset", "6"],
  ["-crf", "35"],
  ["-pix_fmt", "yuv420p"],
].flat();

const H264 = [
  ["-c:v", "libx264"],
  ["-preset", "slow"],
  ["-crf", "23"],
  ["-profile:v", "high"],
  ["-pix_fmt", "yuv420p"],
].flat();

// asset urls are public: drop the phone's GPS and device tags
const COMMON = ["-map_metadata", "-1", "-movflags", "+faststart"];

const QUERY = `*[defined(pageCover.video.file.asset)]{
  _id,
  "asset": pageCover.video.file.asset->{ _id, url }
}`;

async function fetchVideos() {
  const url = new URL(
    `https://${env.SANITY_STUDIO_PROJECT_ID}.apicdn.sanity.io/v2025-02-06/data/query/${env.SANITY_STUDIO_DATASET}`,
  );
  url.searchParams.set("query", QUERY);
  url.searchParams.set("perspective", "published");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`sanity query failed: ${response.status}`);
  }

  const { result } = await response.json();

  const videos = new Map();
  for (const { _id, asset } of result) {
    const video = videos.get(asset._id) ?? { ...asset, documents: [] };
    video.documents.push(_id);
    videos.set(asset._id, video);
  }

  return videos.values().toArray();
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function ffmpeg(options) {
  await run(
    ffmpegPath(),
    ["-hide_banner", "-loglevel", "error", "-y", ...options],
    { maxBuffer: 16 * 1024 * 1024 },
  );
}

async function encode(video) {
  const main = `${CACHE}/${video._id}_main.mp4`;
  const fallback = `${CACHE}/${video._id}_fallback.mp4`;

  if ((await exists(main)) && (await exists(fallback))) {
    console.log(`${video._id}: cached`);
    return;
  }

  console.log(`${video._id}: encoding`);

  const source = `${CACHE}/${video._id}.source`;
  const response = await fetch(video.url);
  if (!response.ok) {
    throw new Error(`${video.url}: ${response.status}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(source));

  // `V`, not `v`: skips a cover-art still, and the audio goes with every other stream
  const input = ["-i", source, "-map", "0:V:0", "-vf", FILTERS];
  await ffmpeg([...input, ...AV1, ...COMMON, `${main}.tmp.mp4`]);
  await ffmpeg([...input, ...H264, ...COMMON, `${fallback}.tmp.mp4`]);
  await rm(source);

  for (const path of [main, fallback]) {
    const { size } = await stat(`${path}.tmp.mp4`);
    if (size > MAX_BYTES) {
      await rm(`${path}.tmp.mp4`);
      throw new Error(
        `${video._id} encodes to ${(size / 1024 / 1024).toFixed(1)} MB, the cap is 10 MB. ` +
          `Trim the cover video of ${video.documents.join(", ")} and publish again.`,
      );
    }
  }

  // renamed last, so an interrupted build never leaves a half file in the cache
  await rename(`${main}.tmp.mp4`, main);
  await rename(`${fallback}.tmp.mp4`, fallback);
}

async function main() {
  if (!isFfmpegAvailable()) {
    throw new Error(
      "node-av has no ffmpeg binary: its postinstall did not run (onlyBuiltDependencies in pnpm-workspace.yaml)",
    );
  }

  const videos = await fetchVideos();

  await mkdir(CACHE, { recursive: true });
  for (const video of videos) {
    await encode(video);
  }

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  for (const video of videos) {
    for (const suffix of ["main", "fallback"]) {
      const name = `${video._id}_${suffix}.mp4`;
      await copyFile(`${CACHE}/${name}`, `${OUT}/${name}`);
    }
  }
}

try {
  await main();
} catch (error) {
  console.error(error.stderr || error.message);
  exit(1);
}
