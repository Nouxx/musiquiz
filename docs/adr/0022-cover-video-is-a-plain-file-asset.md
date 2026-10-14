# Cover video is a plain file asset

A Page Cover can play a short looping video behind its text, the way the legacy site's homepage does. This is a trial. It starts on the homepage and stays off the carousel until we have seen it in production.

The background gets a fourth option, **Video**, next to Image and the two gradients. It reveals a `video` object with two required fields: `file`, a Sanity `file` asset limited to MP4 and WebM, and `poster`, a plain image. The site serves the file straight from Sanity's asset CDN. A field validation reads the asset's `size` and refuses anything over **8 MB**. The legacy hero serves a 5.8 MB MP4 already, so that budget is proven.

The poster renders as the cover's `RemoteImage` with `priority`, so it is the LCP and nothing regresses while the video loads. Over it sits a `<video muted loop playsinline preload="none">` without `autoplay`. A small script calls `play()` only under `prefers-reduced-motion: no-preference`, so a visitor who turns motion off downloads no video at all. The video and poster are decorative: `aria-hidden`, empty alt, no controls, no pause button.

## Alternative: a YouTube background, as the legacy site does

The legacy homepage is Elementor's YouTube background. It loads the YouTube IFrame API with `controls: 0`, mutes and loops the player in JS, keeps the iframe at `opacity: 0` until it reports `PLAYING`, disables pointer events so no overlay appears on hover, and oversizes the 16:9 iframe so the section crops its edges. That is how it shows no controls.

Rejected:

- It loads the IFrame API and the player, around 1 MB of third-party JS, before the cover shows anything.
- Without privacy mode it sets `youtube.com` cookies before any consent. With it, it still talks to Google on every visit.
- The cover is blank until playback starts, which pushes LCP back.
- It depends on YouTube's player chrome staying hideable. YouTube already removed `modestbranding` and the related-videos opt-out (see `VideoEmbed.astro`), and can do the same here.

Its one advantage is free encoding, bandwidth and adaptive streaming. The next alternative buys that properly.

## Alternative: Mux, through `sanity-plugin-mux-input`

Adaptive HLS streaming, automatic thumbnails, and `@mux/mux-background-video` built for this exact use. Rejected for now: a second vendor, account and secret token in the Studio, and a bill, for one short clip on one page. **Move to it when** clips get longer or heavier than the 8 MB cap allows, when mobile LCP or bandwidth suffers, or when the carousel brings many videos to one page. The schema shape stays: only the `file` field and the projection change.

## Alternative: Sanity Media Library video

The same Mux pipeline, billed through Sanity. Rejected: it needs an Enterprise plan plus a video add-on.

## Consequences

- Bandwidth for every play counts against the Sanity project. The 8 MB cap is the guardrail. Editors compress before uploading, as the field description says.
- One rendition for every screen. A phone downloads the same file as a desktop.
- Asset URLs are public, even on a private dataset. Nothing secret goes in a cover video.
- The homepage cover only gained video because it moved onto `pageCover` first. Every other page cover got it for free.
