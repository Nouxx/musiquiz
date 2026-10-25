# Scroll reveal is scroll-linked CSS

Cards that rise into view do it with a scroll-driven animation: `animation-timeline: view()` over `--rise-range`, playing the global `@keyframes rise-in` (`packages/ui/src/styles/base.css`) from `--rise-distance` below and transparent. No JS.

Each component writes its own rule, inside `@media (prefers-reduced-motion: no-preference)` and `@supports (animation-timeline: view())`. Without the `@supports` guard, a browser with no scroll timelines would hold the cards on the `from` keyframe, so they would stay hidden. Firefox, which only has scroll timelines behind a flag, and reduced-motion users get static cards.

- Applied to: `CardsGrid`, `TextCardsGrid`, `VenuesContact`.
- Not applied to blog components: they are written for crawlers, not readers.
- Not applied to `Carousel`: it already drives `translate` from its own view timeline.
- A component whose cards need a different feel overrides the tokens locally rather than changing them for everyone.

## Consequences

Progress follows the scroll. A card that leaves through the bottom of the viewport sinks and fades again, and a card that straddles the fold at page load shows part-way through. There is no "play once".

## Alternative: `animation-trigger`

Plays a timed animation once when the card enters the viewport, which is the classic reveal. Rejected: only very recent Chromium ships it.

## Alternative: an IntersectionObserver that toggles a class

Gives play-once in every browser. Rejected: it is JS for decoration, and before the script runs the cards are either hidden or flash.

## Alternative: a utility class or a `<RiseIn>` wrapper

ADR 0002 rules out utility classes. A wrapper adds an element inside every `li` and breaks the grids' fill-the-track rules.
