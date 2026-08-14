# Design tokens are derived from Figma sheets

Components are built from screenshots. A Figma frame — one for type, one for colour — is the authority for a slice of the token layer, and every styling value a component uses must be traceable to one. The frames are shared into a conversation when needed rather than committed, so the tokens themselves are the durable record of what each sheet said. Where no sheet exists (spacing, letter-spacing, gradient angles) the value is invented and flagged as invented until a sheet supersedes it.

A screenshot of a component is authoritative for **intent**, not for pixels: a measured 43px lands on the nearest scale step, and the deviation is reported rather than hardcoded. This is what keeps ADR 0002's promise that a re-skin is a token-layer edit.

## Typography

Two families, both OFL, both fetched by `fontProviders.google()` and self-hosted by Astro's Fonts API — **Momo Trust Display** (`--font-title`) and **Funnel Display** (`--font-body`). Inter is dropped.

Momo Trust Display **ships weight 400 only**; Google serves no other. Every title token is therefore weight 400, and nothing may ask a title for bold — the browser would synthesise it and a display face fake-bolds badly. This is why `Text` lost its `bold` boolean: the variant carries the weight, and `paragraph-base` vs `paragraph-base-sm` _is_ the regular/semibold choice.

Type Tokens are **single-tier and named for the sheet's own steps** (`--title-h1`, `--paragraph-base`, `--paragraph-base-sm`), against ADR 0002's two-tier intent-naming rule. The sheet has 13 steps to that ADR's 5, so an intent tier would have meant inventing names for eight of them and translating on every design conversation. The sheet is the intent layer. Components never name a step directly — they pass one to `Text`'s `variant`, which is the indirection the two-tier scheme was there to provide.

Titles carry a `clamp()` between an invented mobile floor and the sheet's desktop value, so there are no typography media queries and no undrawn width behaves badly. Line-heights become unitless ratios (the sheet's `60/72` → `/1.2`) so they scale with the clamp; where rounding moved a ratio, it is noted at the token.

**Amendment**: a Type Token may name a **range between two steps** rather than a single step, written `--title-<from>-<to>` (`--title-base-xl`). This is for a component the sheet draws at two different steps at two different widths — the menu button is `title-base` at its 34px size and `title-xl` at its 48px `Mobile` size. Neither step alone expresses it, and the alternatives were worse: a media query needs a breakpoint no sheet gives, and clamping inside the component puts a raw `px` range in scoped CSS, which is the thing this ADR exists to prevent. The rule that survives is the important one — the token still names what the sheet says, and no name is invented. A range token clamps over 375px → 1440px, the range recovered by solving `--title-h1`'s existing clamp for its endpoints; where the two steps disagree on line-height ratio, the settled ratio and its deviation at both ends are noted at the token.

**A range token can run in either direction, and the sheet decides which.** Type usually grows with the viewport, so `--title-base-xl` was first written ascending — 16px at 375px, 18px at 1440px — on the assumption rather than on the drawing. The sheet says the opposite: the menu button is `title-xl` at its **48px Mobile** size and `title-base` at its **34px desktop** size, so the token descends. The same reversal applied to `MenuButton`'s own padding clamps, which had been derived from the token's direction rather than from the sheet's two button heights. Every desktop frame past 1440px pinned all three to their maximum, which rendered the mobile button at desktop widths — and nothing caught it, because a component built and reviewed at one width looks self-consistent at that width. Read both ends off the sheet before writing the clamp; the direction is a measurement, not a default.

## Colour

Primitives mirror the sheet's palette translated to English (`Rouge 500` → `--red-500`) — the repo is English everywhere else, and the FR→EN mapping is written down once in `CONTEXT.md` rather than remembered.

Semantics are a small closed set of **roles**, not one token per component. A new component reuses `--color-surface`, `--color-text-on-media`, `--color-accent-fill`, `--color-border-brand`; it does not mint `--color-badge-border`. A per-component tier would grow linearly with the component count and turn a re-skin back into an 80-line edit.

## Consequences

- Swapping either family is one line in `astro.config.mjs` plus one token; no component names a family.
- A design change that is not on a Figma sheet has no legitimate home in the token layer — that friction is deliberate and is how sheets get produced.
- Spacing is a numeric 4px scale (`--space-1` … `--space-24`) rather than t-shirt sizes, because measured Figma values land on a grid step and t-shirt names stop mapping to pixels past ~6 steps. `Flex`'s `gap` union follows the numeric names.
- The `[data-theme]` hook from ADR 0002 survives: roles are what an alternate theme overrides.
