# Cover video is a plain file asset

A Page Cover can play a short looping video behind its text, the way the legacy site's homepage does. This is a trial. It starts on the homepage and stays off the carousel until we have seen it in production.

The background gets a fourth option, **Video**, next to Image and the two gradients. It reveals a `video` object with two required fields: `file`, a Sanity `file` asset, and `poster`, a plain image. A field validation refuses anything that is not `video/mp4` or is over **15 MB**. Other formats are converted by the editor before upload.

The upload is a source, not what visitors download. Before `astro build`, the static build encodes each published cover video twice: AV1 first, H.264 as the fallback. It fits the clip into 1080p, caps it at 30 fps, drops the audio and the metadata, and bundles both files into `dist/static/_astro/`. Cloudflare serves them with the rest of the site, so playback no longer counts against Sanity bandwidth. An encode over **10 MB** fails the build and names the document. The legacy hero serves a 5.8 MB MP4 already, so that budget is proven. Encodes are cached by asset id in Astro's cache directory, which Workers Builds keeps between builds. The draft preview and `dev` play the raw upload: neither can encode.

ffmpeg comes from `node-av`, which downloads a pinned build with SVT-AV1 and x264 for the host platform at install. The AV1 `<source>` declares its codecs (`av01.0.08M.08`), which the encoder settings fix. Without them, Safari on hardware with no AV1 decoder picks the AV1 file and never reaches the fallback.

The poster renders as the cover's `RemoteImage` with `priority`, so it is the LCP and nothing regresses while the video loads. Over it sits a `<video muted loop playsinline preload="none">` without `autoplay`. A small script calls `play()` only under `prefers-reduced-motion: no-preference`, so a visitor who turns motion off downloads no video at all. The video and poster are decorative: `aria-hidden`, empty alt, no controls, no pause button.

## Alternative: the editor encodes with a local script

A `pnpm video` script made the AV1, H.264 and poster files for the editor to upload as three fields. Rejected: every editor needs the repo and a terminal, and nothing stops a hand-exported file in the wrong field.

## Alternative: encode where the video is served

- **Per request in the SSR worker**: a Worker cannot run a native ffmpeg, and a WASM AV1 encode is far past its CPU limits.
- **Cloudflare Media Transformations** (`/cdn-cgi/media/`): resizes and extracts frames on the fly, but outputs H.264 only, and bills every second of output.
- **A Sanity Function on publish**, writing the encodes back to the document: no build cost, but a second runtime to deploy, ffmpeg inside it unproven, and the bandwidth stays on Sanity.

## Alternative: `ffmpeg-static`

Its Linux binary has libaom 3.2 and no SVT-AV1, several times slower to encode on a build runner.

## Alternative: a YouTube background, as the legacy site does

The legacy homepage is Elementor's YouTube background. It loads the YouTube IFrame API with `controls: 0`, mutes and loops the player in JS, keeps the iframe at `opacity: 0` until it reports `PLAYING`, disables pointer events so no overlay appears on hover, and oversizes the 16:9 iframe so the section crops its edges. That is how it shows no controls.

Rejected:

- It loads the IFrame API and the player, around 1 MB of third-party JS, before the cover shows anything.
- Without privacy mode it sets `youtube.com` cookies before any consent. With it, it still talks to Google on every visit.
- The cover is blank until playback starts, which pushes LCP back.
- It depends on YouTube's player chrome staying hideable. YouTube already removed `modestbranding` and the related-videos opt-out (see `VideoEmbed.astro`), and can do the same here.

Its one advantage is free encoding, bandwidth and adaptive streaming. The next alternative buys that properly.

## Alternative: Mux, through `sanity-plugin-mux-input`

Adaptive HLS streaming, automatic thumbnails, and `@mux/mux-background-video` built for this exact use. Rejected for now: a second vendor, account and secret token in the Studio, and a bill, for one short clip on one page. **Move to it when** clips get longer or heavier than the 10 MB cap allows, when mobile LCP or bandwidth suffers, or when the carousel brings many videos to one page. The schema shape stays: only the `file` field and the projection change.

## Alternative: Sanity Media Library video

The same Mux pipeline, billed through Sanity. Rejected: it needs an Enterprise plan plus a video add-on.

## Consequences

- A new cover video adds its encode time to the next static build. Cached ones cost nothing. A cache purged after 7 idle days re-encodes everything once.
- Publishing a long or heavy clip can fail the deploy. That is the guardrail on what visitors download.
- One size for every screen. A phone downloads the same file as a desktop, only the codec differs.
- The draft preview plays the raw upload: what an editor sees there is heavier than what ships.
- Asset URLs are public, even on a private dataset. Nothing secret goes in a cover video.
- The homepage cover only gained video because it moved onto `pageCover` first. Every other page cover got it for free.
