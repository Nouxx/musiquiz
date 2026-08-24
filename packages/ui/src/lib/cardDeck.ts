import { tiltAtDepth } from "./deck";

const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)");

const SWIPE_THRESHOLD = 80;

/** below this the gesture is a tap, not a swipe */
const TAP_SLOP = 6;

/** WARNING: must match the `.leaving` transition in CardDeck.astro */
const EXIT_MS = 320;

export function setUpCardDeck(deck: HTMLElement) {
  const cards = [...deck.querySelectorAll<HTMLElement>("[data-deck-card]")];

  if (cards.length < 2) {
    return;
  }

  const control = deck.querySelector<HTMLElement>("[data-deck-next]");

  let front = 0;
  let isDealing = false;

  function depthOf(index: number) {
    return (index - front + cards.length) % cards.length;
  }

  function apply(card: HTMLElement, depth: number) {
    card.style.setProperty("--depth", String(depth));
    card.style.setProperty("--tilt", `${tiltAtDepth(depth)}deg`);
    // links on buried cards stay out of the tab order
    card.inert = depth !== 0;
  }

  function paint(except?: HTMLElement) {
    for (const [index, card] of cards.entries()) {
      if (card !== except) {
        apply(card, depthOf(index));
      }
    }
  }

  function frontCard() {
    return cards[front];
  }

  function settle(card: HTMLElement) {
    card.classList.add("settling");
    card.classList.remove("leaving");
    card.style.removeProperty("--exit");
    apply(card, depthOf(cards.indexOf(card)));
    void card.offsetWidth;
    card.classList.remove("settling");
    isDealing = false;
  }

  function deal(direction: "left" | "right") {
    if (isDealing) {
      return;
    }

    const leaving = frontCard();

    if (!leaving) {
      return;
    }

    front = (front + 1) % cards.length;

    if (REDUCED_MOTION.matches) {
      paint();
      return;
    }

    isDealing = true;
    leaving.style.setProperty("--exit", direction === "left" ? "-1" : "1");
    leaving.classList.add("leaving");
    paint(leaving);

    setTimeout(function afterExit() {
      settle(leaving);
    }, EXIT_MS);
  }

  function drag(card: HTMLElement, distance: number) {
    card.style.setProperty("--drag", `${distance}px`);
    card.style.setProperty("--drag-tilt", `${distance / 24}deg`);
  }

  function clearDrag(card: HTMLElement) {
    card.style.removeProperty("--drag");
    card.style.removeProperty("--drag-tilt");
  }

  function onPointerDown(event: PointerEvent) {
    const target = event.target;

    if (!(target instanceof Element) || isDealing) {
      return;
    }

    const card = frontCard();

    // a link in the copy keeps its own click
    if (!card || !card.contains(target) || target.closest("a, button")) {
      return;
    }

    const startX = event.clientX;
    let distance = 0;

    card.setPointerCapture(event.pointerId);
    card.classList.add("dragging");

    function onMove(move: PointerEvent) {
      distance = move.clientX - startX;
      drag(card, distance);
    }

    function onUp() {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerup", onUp);
      card.removeEventListener("pointercancel", onUp);
      card.classList.remove("dragging");
      clearDrag(card);

      if (Math.abs(distance) > SWIPE_THRESHOLD) {
        deal(distance < 0 ? "left" : "right");
        return;
      }

      if (Math.abs(distance) < TAP_SLOP) {
        deal("right");
      }
    }

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerup", onUp);
    card.addEventListener("pointercancel", onUp);
  }

  deck.addEventListener("pointerdown", onPointerDown);

  control?.addEventListener("click", function onControlClick() {
    deal("right");
  });

  deck.dataset.ready = "true";
  paint();
}

export function mountCardDecks(selector: string) {
  for (const deck of document.querySelectorAll<HTMLElement>(selector)) {
    setUpCardDeck(deck);
  }
}
