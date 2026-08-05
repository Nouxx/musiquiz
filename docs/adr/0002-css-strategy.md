# CSS strategy: native scoped styles + two-tier tokens

Styling in `apps/web` uses Astro's native scoped `<style>` per component plus a global two-tier design-token system — **Primitive Tokens** (raw palette, e.g. `--blue-500`) aliased by **Semantic Tokens** (intent, e.g. `--color-accent`, `--text-title`) — defined in `packages/ui/src/styles/{tokens,reset,base}.css` and imported once in `BaseLayout`. The token files live in `packages/ui` rather than the app because UI Components consume the tokens, and ADR 0001 forbids them depending upward on an app.

Components reference only Semantic Tokens. The default Theme lives on `:root`; alternate Themes override Semantic Tokens under `[data-theme="…"]` (built as a hook now, only one theme shipped).

We chose this over Tailwind/utility-first and over CSS Modules / vanilla-extract: scoped styles are zero-dependency and idiomatic to Astro, the two-tier layer makes re-theming a token-only change, and we avoid coupling markup to styling or fighting Astro's built-in scoping.

## Consequences

- A re-skin or dark mode is a token-layer edit, no component changes.
- Typography is delivered via the Astro Fonts API into `--font-*`, exposed as `--text-*` composite tokens, and consumed through a `Text` UI Component (variant → token) rather than raw font rules.
- No utility classes — expect more named, scoped class rules; this is deliberate, not an oversight. Layout **Primitives** (`packages/ui/src/primitives/`, e.g. `Flex`) are the one carve-out: a closed, typed prop set mapped onto Semantic Tokens is not a utility class, because the markup stays free of styling strings and the values cannot escape the token layer. The bar for a new Primitive is a prop set that is closed and token-bound; `class="flex gap-4"` remains out.
- Primitives take props through CSS custom properties set in an inline `style` attribute, read by a static scoped rule. This keeps one hoisted stylesheet per Primitive with per-instance values. `define:vars` is not used for this — it opts the component out of style hoisting, emitting a `<style>` tag per instance.
- A component that accepts a `class` passthrough **must** also spread its rest props. Astro passes the consumer's scope marker as a separate `data-astro-cid-*` prop, so a component that takes `class` but drops the rest renders the class without the marker and the consumer's scoped rule silently never matches.
