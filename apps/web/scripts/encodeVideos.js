import { execFile } from "node:child_process";
import { createWriteStream } from "node:fs";
import { copyFile, mkdir, rename, rm, stat } from "node:fs/promises";
import { env, exit } from "node:process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";

import { ffmpegPath, isFfmpegAvailable } from "node-av/ffmpeg";

/**
 * Encodes every published cover and carousel video into an AV1 and an H.264
 * MP4, for the static build to bundle. See docs/adr/0022-cover-video-is-a-plain-file-asset.md
 * and docs/adr/0023-carousel-video.md
 */
const run = promisify(execFile);

const MAX_SECONDS = 15;

// Workers Builds keeps Astro's cache directory between builds, nothing else of ours.
// Encodes are keyed by asset only: a new encode setting needs a new directory
const CACHE = `./node_modules/.astro/video-${MAX_SECONDS}s`;
const OUT = "./src/generated/video";

const MB = 1024 * 1024;

// a carousel slot is at most 282px wide, 563px on a 2x screen
const PROFILES = {
  cover: { long: 1920, short: 1080, maxKbps: 4000, maxBytes: 10 * MB },
  carousel: { long: 1280, short: 720, maxKbps: 1200, maxBytes: 5 * MB },
};

// fits long x short, or short x long for a portrait clip, never upscaled
function filters({ long, short }) {
  return (
    `scale=w='min(iw,if(gte(iw,ih),${long},${short}))':h='min(ih,if(gte(iw,ih),${short},${long}))'` +
    ":force_original_aspect_ratio=decrease:force_divisible_by=2" +
    ",fps=fps='min(source_fps,30)'"
  );
}

// CRF alone spends bits on a social-media export's compression artifacts and
// comes out heavier than the upload, so the bitrate is capped too.
// src/libs/getVideoSources.ts declares this profile in its codecs string
function av1(kbps) {
  return [
    ["-c:v", "libsvtav1"],
    ["-preset", "6"],
    ["-crf", "35"],
    ["-svtav1-params", `mbr=${kbps}`],
    ["-pix_fmt", "yuv420p"],
  ].flat();
}

function h264(kbps) {
  return [
    ["-c:v", "libx264"],
    ["-preset", "slow"],
    ["-crf", "23"],
    ["-maxrate", `${kbps}k`],
    ["-bufsize", `${2 * kbps}k`],
    ["-profile:v", "high"],
    ["-pix_fmt", "yuv420p"],
  ].flat();
}

// asset urls are public: drop the phone's GPS and device tags
const COMMON = ["-map_metadata", "-1", "-movflags", "+faststart"];

const CAROUSEL_VIDEOS = `(
   coalesce(pageComponents, []) +
   coalesce(componentsBeforeWidget, []) +
   coalesce(componentsAfterWidget, []) +
   coalesce(componentsBeforeMap, []) +
   coalesce(componentsAfterMap, [])
 )[_type == "carousel"].slides[_type == "carouselVideo"]`;

const QUERY = `*[(pageCover.background == "video" && defined(pageCover.video.file.asset)) || count(${CAROUSEL_VIDEOS}) > 0]{
  _id,
  "cover": select(pageCover.background == "video" => pageCover.video.file.asset->{ _id, url }),
  "carousel": coalesce(${CAROUSEL_VIDEOS}[defined(file.asset)].file.asset->{ _id, url }, [])
}`;

async function fetchVideos() {
  const url = new URL(
    `https://${env.SANITY_STUDIO_PROJECT_ID}.api.sanity.io/v2025-02-06/data/query/${env.SANITY_STUDIO_DATASET}`,
  );
  url.searchParams.set("query", QUERY);
  url.searchParams.set("perspective", "published");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`sanity query failed: ${response.status}`);
  }

  const { result } = await response.json();

  const videos = new Map();
  function add(asset, profile, document) {
    const key = `${asset._id}_${profile}`;
    const video = videos.get(key) ?? { ...asset, profile, documents: [] };
    if (!video.documents.includes(document)) {
      video.documents.push(document);
    }
    videos.set(key, video);
  }

  for (const { _id, cover, carousel } of result) {
    if (cover) {
      add(cover, "cover", _id);
    }
    for (const asset of carousel) {
      add(asset, "carousel", _id);
    }
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

// node-av ships no ffprobe; `ffmpeg -i` alone exits with an error after printing the bitrate
async function sourceKbps(source) {
  try {
    await run(ffmpegPath(), ["-hide_banner", "-i", source]);
  } catch (error) {
    const match = /bitrate: (\d+) kb\/s/.exec(error.stderr ?? "");
    if (match) {
      return Number(match[1]);
    }
  }

  return Infinity;
}

function baseName(video) {
  return `${video._id}_${video.profile}`;
}

async function encode(video) {
  const name = baseName(video);
  const profile = PROFILES[video.profile];
  const main = `${CACHE}/${name}_main.mp4`;
  const fallback = `${CACHE}/${name}_fallback.mp4`;

  if ((await exists(main)) && (await exists(fallback))) {
    console.log(`${name}: cached`);
    return;
  }

  console.log(`${name}: encoding`);

  const source = `${CACHE}/${name}.source`;
  const response = await fetch(video.url);
  if (!response.ok) {
    throw new Error(`${video.url}: ${response.status}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(source));

  // `V`, not `v`: skips a cover-art still, and the audio goes with every other stream
  const input = [
    ["-t", String(MAX_SECONDS), "-i", source],
    ["-map", "0:V:0", "-vf", filters(profile)],
  ].flat();
  // never heavier than the upload
  const kbps = Math.min(profile.maxKbps, await sourceKbps(source));
  await ffmpeg([...input, ...av1(kbps), ...COMMON, `${main}.tmp.mp4`]);
  await ffmpeg([...input, ...h264(kbps), ...COMMON, `${fallback}.tmp.mp4`]);
  await rm(source);

  for (const path of [main, fallback]) {
    const { size } = await stat(`${path}.tmp.mp4`);
    if (size > profile.maxBytes) {
      await rm(`${path}.tmp.mp4`);
      throw new Error(
        `${name} encodes to ${(size / MB).toFixed(1)} MB, the cap is ${profile.maxBytes / MB} MB. ` +
          `Trim the ${video.profile} video of ${video.documents.join(", ")} and publish again.`,
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
      const name = `${baseName(video)}_${suffix}.mp4`;
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
