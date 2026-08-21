const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)");

/**
 * Drives one scroll-snap track from its dots and arrows.
 *
 * The track is whatever `[data-carousel-track]` points at, and the controls are
 * the `[data-carousel-dot]` buttons plus the two `[data-scroll-arrow]` ones, so
 * the same controller serves a five-slot band and a one-up frame alike: nothing
 * here knows how many items a viewport shows.
 */
export function setUpCarousel(carousel: HTMLElement) {
  const track = carousel.querySelector<HTMLElement>("[data-carousel-track]");
  const previous = carousel.querySelector('[data-scroll-arrow="previous"]');
  const next = carousel.querySelector('[data-scroll-arrow="next"]');

  if (!track || !previous || !next) {
    return;
  }

  const dots = [
    ...carousel.querySelectorAll<HTMLElement>("[data-carousel-dot]"),
  ];

  const scroller: HTMLElement = track;

  // measured rather than derived from the band: the two items' distance is
  // the item width plus the gutter, whatever the CSS resolved them to
  function step() {
    const [first, second] = scroller.children;

    if (!first || !second) {
      return scroller.clientWidth;
    }

    return (
      second.getBoundingClientRect().left - first.getBoundingClientRect().left
    );
  }

  function lastPosition() {
    const scrollable = scroller.scrollWidth - scroller.clientWidth;

    return Math.max(0, Math.round(scrollable / step()));
  }

  function currentPosition() {
    const position = Math.round(scroller.scrollLeft / step());

    if (position < 0) {
      return 0;
    }

    return Math.min(position, lastPosition());
  }

  function goTo(position: number) {
    scroller.scrollTo({
      left: position * step(),
      behavior: REDUCED_MOTION.matches ? "auto" : "smooth",
    });
  }

  function render() {
    const position = currentPosition();
    const last = lastPosition();

    for (const [index, dot] of dots.entries()) {
      // one dot per reachable position, not per image
      dot.parentElement?.toggleAttribute("hidden", index > last);
      dot.setAttribute("aria-current", index === position ? "true" : "false");
    }
  }

  next.addEventListener("click", () => {
    const position = currentPosition();

    // at the end the arrow rewinds rather than dying
    goTo(position >= lastPosition() ? 0 : position + 1);
  });

  previous.addEventListener("click", () => {
    const position = currentPosition();

    goTo(position <= 0 ? lastPosition() : position - 1);
  });

  for (const [index, dot] of dots.entries()) {
    dot.addEventListener("click", () => goTo(index));
  }

  let frame = 0;

  track.addEventListener("scroll", () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
  });

  // a band change moves the slot count, so both the step and how many positions exist change with it
  new ResizeObserver(render).observe(track);

  render();
}

export function mountCarousels(selector: string) {
  for (const carousel of document.querySelectorAll<HTMLElement>(selector)) {
    setUpCarousel(carousel);
  }
}
