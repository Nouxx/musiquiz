# CSS strategy: native scoped styles + two-tier tokens

Styling in `apps/web` uses Astro's native scoped `<style>` per component plus a global two-tier design-token system — **Primitive Tokens** (raw palette, e.g. `--blue-500`) aliased by **Semantic Tokens** (intent, e.g. `--color-accent`, `--text-title`) — defined in `src/styles/{tokens,reset,base}.css` and imported once in `BaseLayout`.

Components reference only Semantic Tokens. The default Theme lives on `:root`; alternate Themes override Semantic Tokens under `[data-theme="…"]` (built as a hook now, only one theme shipped).

We chose this over Tailwind/utility-first and over CSS Modules / vanilla-extract: scoped styles are zero-dependency and idiomatic to Astro, the two-tier layer makes re-theming a token-only change, and we avoid coupling markup to styling or fighting Astro's built-in scoping.

## Consequences

- A re-skin or dark mode is a token-layer edit, no component changes.
- Typography is delivered via the Astro Fonts API into `--font-*`, exposed as `--text-*` composite tokens, and consumed through a `Text` UI Component (variant → token) rather than raw font rules.
- No utility classes — expect more named, scoped class rules; this is deliberate, not an oversight.
