# Components isolate their z-index

A UI Component that orders its own children with `z-index` sets `isolation: isolate` on its root. Only page overlays put a `z-index` in the root stacking context, and they read it from a `--layer-*` token in `packages/ui/src/styles/tokens.css`.

A `z-index` competes in the nearest ancestor stacking context, not inside the component that declares it. `CardDeck` stacked its cards at 97–100, nothing above them made a stacking context, so they competed with the header (10) and the pop-up (10) and covered both. Any value a component picks for its own needs is a bet against every overlay on the page.

- Isolated roots: `Section` (covers `Logos`, `Carousel` and anything else built on it), `PageCover`, `Card`, `CardDeck`.
- Layers: `--layer-popup` below `--layer-toast` below `--layer-header`. An open menu is the user's current action; a toast confirms the action just taken, so it covers the pop-up, which is a promotion. The 4escape add-to-cart alert is the only toast.
- The mobile menu is a `<dialog>` opened with `showModal()`, so it lives in the top layer and needs no token.

## Consequences

A new component that uses `z-index` without isolating its root works until its values outgrow a layer, then covers the header. Review catches it, nothing else does.

## Alternative: lower the deck's values below 10

Fixes this page. The next component that picks a larger number breaks it again.

## Alternative: the Popover API for the header menu and the pop-up

The top layer paints above every stacking context, so no layer scale is needed, and `popover="auto"` brings light dismiss and Esc for free. Rejected for now: the header is `position: fixed` directly under the layout, so nothing can trap it, and a panel in the top layer no longer positions against its `.menu`. It would need CSS anchor positioning and a rewrite of the `<details>` markup and script. Worth it once an overlay is nested inside an isolated or transformed ancestor.
