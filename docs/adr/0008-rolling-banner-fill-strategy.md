# Rolling Banner fills its width from a build-time width estimate

A **Rolling Banner** repeats one short message across the full viewport width and scrolls it horizontally, forever. How many copies that takes depends on the rendered width of the message, which depends on the message — CMS content — and on the font's real metrics. CSS cannot count.

We answer it at **build time**: `RollingBanner.astro` estimates one copy's width as `message.length × AVG_GLYPH_WIDTH_EM × 24px + 80px gap`, derives the copy count from `WIDEST_VIEWPORT_PX`, renders two identical halves of that many copies, and animates the track by `translateX(-50%)` over a duration computed as `half-width ÷ SCROLL_SPEED_PX_PER_SEC`. The component ships as static HTML and CSS, with no client JavaScript.

**Amended: `packages/ui` is no longer JavaScript-free.** The original text said "`packages/ui` has none today and this keeps it that way". `Header` broke that when it shipped a dismissal script for its `<details>` menus. The carve-out and what survives of the rule are below.

Deriving the duration from the estimated width, rather than fixing it, is what makes the scroll a constant ~90 px/s regardless of how long the message is. It also makes the animation independent of the viewport, so nothing has to react to a resize: the copy count is sized for the widest screen we care about and is simply over-provisioned on every smaller one.

The three tuning constants all **bias low** deliberately, because the failure modes are asymmetric. Under-estimating a copy's width renders too many copies — harmless, they are clipped — and runs the scroll slightly fast. Over-estimating renders too few, and a visible hole opens in the strip on wide screens. So `AVG_GLYPH_WIDTH_EM` is 0.45 rather than a truthful ~0.5 for a display face, `WIDEST_VIEWPORT_PX` is 3840 rather than 2560, and `EXTRA_COPIES` adds two more on top.

## Alternative: measure on the client

The exact version measures the rendered width of one copy in the browser, clones until the track covers the viewport, and recomputes under a `ResizeObserver`. It is correct by construction — no font-metric guesswork, so the speed is exactly the constant and the copy count is exactly right at every width.

It was not chosen because it puts the first client-side script into `packages/ui` for a decorative strip, and because the banner would render unfilled until that script runs — a visible reflow near the top of the homepage. **Revisit it if** the estimate proves visibly wrong on real content (a short message leaving a gap, or a scroll speed that reads as inconsistent between pages), or once the package ships client JS for another reason and the marginal cost drops.

**That second trigger has fired, and the decision is unchanged.** `Header` shipped client JS, so the "first script" cost is spent. But it was only half the argument: the banner would still render unfilled until its script runs, near the top of the page, and that half is untouched by what `Header` does. The first trigger — the estimate proving visibly wrong on real content — has not fired at all. Revisit again if it does.

## Amendment: the client-JavaScript carve-out

A UI Component **may** ship client JavaScript when it owns an interactive disclosure whose dismissal HTML has no answer for. `Header` is the first and, so far, only case: `<details name>` gives open, close and mutual exclusivity natively, but nothing native closes a menu on click-outside or on Escape, and a header menu without either reads as broken.

The rule that survives is narrower than "no JS" and does more work:

- **Static presentation ships zero JavaScript.** A component that only renders content — `RollingBanner`, `Icon`, `Text`, `PageCover` — has no route to a script. "It would be more exact with JS" is not a reason; it was the losing argument above and stays losing.
- **JavaScript is enhancement, never load-bearing.** Every control must work with the script absent: `Header`'s menus open, close, and stay exclusive from the markup alone, and the script only adds the two dismissals. A component that needs its script to function is a Feature Component's problem, not a UI Component's.

The practical consequence is that `packages/ui`'s zero-JS property can no longer be asserted package-wide, only per component. Anything relying on the old blanket claim — bundle-size assumptions, "this package cannot hydrate" reasoning — needs re-checking against the individual component.

## Alternative: a hardcoded copy count

Rejected outright. A fixed N breaks on short CMS strings — the shorter the message, the wider the gap — and makes the scroll speed a function of message length, so two banners with different copy move at different speeds.

## Consequences

- The scroll speed is approximate: expect up to ~10% fast. It is a constant in one file, tuned by eye.
- Copy count is over-provisioned on ordinary viewports. Copies are text nodes; the cost is a few dozen spans and no images.
- A message far longer than the viewport still works — the count floors at two halves — but the sentence is then never on screen whole.
- The two halves must stay **identical**. `translateX(-50%)` is only seamless because of that, and it is also why the `prefers-reduced-motion` end state looks like the start state. The component states `animation: none` explicitly under that media query rather than relying on the symmetry.
