# Carousel video

The client wants to put portrait clips in the Carousel, the kind people shoot on a phone and post to social media, most of them filmed by real customers. This builds on [ADR 0022](./0022-cover-video-is-a-plain-file-asset.md) and lifts its "off the carousel" line. Upload, encode, caching and serving all work the way they do for a cover. This record covers only what is different.

The carousel's `images` becomes `slides`: one array where each member is a photo (`imageWithAlt`) or a `video`. The editor orders them freely, and the 5 to 12 count covers both. `video` is the object type the Page Cover already used (`file` and `poster`, MP4 only, under 15 MB), now a named type shared by both. A migration renamed the field on every existing carousel.

A carousel video is decorative, like the cover's. It plays muted, on a loop, with no controls, and the encode drops the audio. The poster is a plain image with an empty alt. Because nothing inside a video slide is announced, its `<li>` is `aria-hidden`: a screen reader skips it rather than landing on an empty item. Dots and arrows scroll by position, so they are unaffected.

`BackgroundVideo` now plays a video only while it is in view and pauses it when it leaves, through an `IntersectionObserver`. The observer takes the track's overflow into account, so a slide scrolled out of the band pauses too. The cover is in view on load, so it starts as before, and now also pauses once the visitor scrolls past it. The reduced-motion gate is unchanged.

The build encodes a carousel video with its own profile: fitted into 720×1280 (portrait) or 1280×720, and failing over **5 MB**. A slot is at most 282px wide, 563px on a 2x screen, so the cover's 1080p would be wasted pixels. An asset used in both a cover and a carousel is encoded once per profile. Encodes are keyed `<assetId>_<profile>`.

There is no cap on how many slides are videos.

## Alternative: a separate `videos` array

The component would interleave the two lists or pin videos to fixed slots. Rejected: the editor loses control over the order, and the 5 to 12 count would have to span two fields.

## Alternative: an optional video on top of an image slide

The image would double as the poster, so no second field. Rejected: a photo chosen and cropped as a still is the wrong poster for a clip, and a clip with no matching photo would need a fake one.

## Alternative: the clip as content, with sound

Muted autoplay with a tap to unmute, or a poster with a play button. Testimonials usually talk, so this fits UGC better. Rejected for now: it needs controls, captions or a transcript, logic to pause the other slides, and a different encode. **Revisit** if the client says people speak in these clips.

## Alternative: play on load, like the cover used to

Rejected: the carousel sits below the fold and shows up to five slots at once. Every video on the page would download and decode with nobody looking at it.

## Alternative: a cap on videos per carousel

Rejected by the client. ADR 0022 names "the carousel brings many videos to one page" as the trigger to move to Mux. With no cap, watch the build time and page weight of carousels that carry several clips.

## Consequences

- Each new carousel clip adds its encode to the next static build, like a cover clip.
- A video slide does not exist for assistive tech. If a clip carries information, it has to be a photo or text instead.
- The `carousel.goToImage` label became `carousel.goToSlide`, everywhere it is used.
