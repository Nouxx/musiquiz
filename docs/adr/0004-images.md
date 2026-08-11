# Images are bundled at build time, never served by Sanity

Images authored in Sanity (**CMS Images**) are downloaded, processed and emitted into `dist/` by Astro's asset pipeline during the static build. Sanity's CDN is a source of bytes at build time only — it is never a runtime dependency of the published site. Once deployed, the site keeps rendering every image whether or not Sanity is reachable.

This is the whole point of the design, and it rules out the obvious path: `@sanity/image-url` (or a `next-sanity/image`-style component) building `cdn.sanity.io` URLs that visitors' browsers resolve. That approach is less code and gets on-demand transforms for free, but it makes every page view depend on Sanity being up and bills per visitor forever instead of once per deploy.

## How a CMS Image reaches the page

A `cmsImage` object in Sanity (an `image` plus an optional localized `alt`) is projected in the service layer into a **descriptor** — `{ url, width, height, mimeType, alt }` — via a single `toCmsImage()` helper. `packages/ui`'s `RemoteImage` UI Component takes that descriptor and renders it. It contains no Sanity knowledge, so it stays a UI Component under ADR 0001 and can be used by `PageCover` and friends without an upward dependency. It is not how icons are rendered — see [ADR 0007](./0007-icons.md), which covers repo-owned vector marks; `RemoteImage` handles editor-owned artwork only, including the footer's payment marks.

Explicit dimensions are not an optimization: Astro's `verifyOptions` throws `MissingImageDimension` for any string `src`, so a bare URL cannot be rendered at all. They come from `asset->metadata.dimensions`, clamped to the source cap. The alternative, `inferSize: true`, costs a network round trip per image and is unavailable under the preview build's passthrough service.

The **Source Image** — the one rendition the build pulls and treats as master — is capped at `?w=2560&fit=max`. 2560 covers a 1280px slot at 2× DPR; beyond that nobody can see the difference, and uncapped originals hit the "un-optimised image" billing path Sanity warns about, on every cold CI build.

Call sites choose a closed **Image Variant** (`logo`, `payment-icon`, `cover`), never a raw `sizes` string. A `sizes` value is only correct if it matches the CSS that sizes the container, and that CSS lives in `packages/ui` — passing `sizes` from a Feature Component puts the value in the one place that cannot see what makes it true, where it drifts silently and ships wrong-sized bytes forever. This is ADR 0002's "markup stays free of styling strings" applied to responsive images.

## Consequences

- **Astro does not clamp srcset for remote images.** The "never upscale past the source" filter in `getSrcSet` is inside an `isESMImportedImage` branch — local assets get it, string sources do not. `RemoteImage` must filter variant widths against the descriptor's width itself, or a 900px upload will be upscaled to a 2560w candidate.
- **A missing allowlist fails silently and invisibly.** If `cdn.sanity.io` is absent from `image.domains`, `getURL` returns the Sanity URL untouched — no warning, build green, pages perfect, and `dist/` full of live CDN links. The requirement fails only during an outage. A post-build assertion greps `dist/static/**/*.html` for `cdn.sanity.io` and fails the build on any hit.
- **The ssr build deliberately does the opposite.** `image.domains` is empty when `isSsrBuild`, so `getURL` returns raw CDN URLs and the Cloudflare worker does not proxy image bytes it would not transform anyway (the adapter runs `imageService: "passthrough"`). Sanity is up by definition when previewing drafts. `RemoteImage` is byte-identical across both builds; only config forks.
- **Uploaded SVGs stay SVG, and are never inlined.** Astro's sharp service hard-errors on an SVG source unless `format="svg"` passes it through untouched; `RemoteImage` selects that path from `mimeType` and emits no widths, since srcset on a vector is waste. CMS SVG is always rendered through `<img src>` — inlining CMS-authored markup would execute any `<script>` it carries in our origin.
- **`<Picture>` with `avif` + `webp`** doubles derived files: `images × widths × formats`, ~10 files per image. Cloudflare Workers cap static assets at 20,000 files — irrelevant at today's scale, but it is the first wall if image count grows.
- **No image field sets `options.hotspot`.** Crop and hotspot are per-usage metadata that only materialize if the front end asks for them via `?rect=`; enabling the Studio crop tool while ignoring its output would show editors a control that silently does nothing.
- Every static build re-downloads every image on a cold cache (CI). Accepted deliberately — build time is not a constraint here, and it buys runtime independence.
- **Local Assets do not use `RemoteImage`.** Images committed to the repo are ESM imports with intrinsic metadata and go straight through Astro's `<Image>`; they need no descriptor, no dimension plumbing and no allowlist.
